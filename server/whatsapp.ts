import puppeteer, { Browser, Page } from "puppeteer";
import { execSync } from "child_process";

let browser: Browser | null = null;
let page: Page | null = null;
let isConnected: boolean = false;
let userInfo: { name: string; phone: string } | null = null;

function findChromiumPath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const path = execSync("which chromium", { encoding: "utf-8" }).trim();
    if (path) {
      return path;
    }
  } catch (error) {
    console.warn("Could not find chromium via 'which'");
  }

  throw new Error("Chromium executable not found. Please set PUPPETEER_EXECUTABLE_PATH environment variable.");
}

export async function initBrowser() {
  if (browser) {
    return browser;
  }

  const chromiumPath = findChromiumPath();
  
  console.log(`Launching Chromium from: ${chromiumPath}`);

  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
    executablePath: chromiumPath,
  });

  console.log("Browser launched successfully");
  return browser;
}

export async function getWhatsAppQR(): Promise<Buffer> {
  try {
    console.log("Initializing browser...");
    const browser = await initBrowser();
    
    if (!page) {
      console.log("Creating new page...");
      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
    }

    console.log("Navigating to WhatsApp Web...");
    await page.goto("https://web.whatsapp.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("Waiting for QR code...");
    await page.waitForSelector('canvas[aria-label*="Scan"]', {
      timeout: 45000,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Finding QR code element...");
    const qrElement = await page.$('canvas[aria-label*="Scan"]');
    
    if (!qrElement) {
      throw new Error("QR code element not found on page");
    }

    console.log("Taking screenshot...");
    const screenshot = await qrElement.screenshot({
      type: "png",
    });

    console.log("Screenshot captured successfully");
    return screenshot as Buffer;
  } catch (error) {
    console.error("Error capturing QR code:", error);
    
    if (page) {
      await page.close();
      page = null;
    }
    
    throw error;
  }
}

export async function checkConnectionStatus(): Promise<boolean> {
  if (!page) {
    isConnected = false;
    return false;
  }

  try {
    const hasQR = await page.$('canvas[aria-label*="Scan"]');
    if (hasQR) {
      isConnected = false;
      return false;
    }

    const isLoggedIn = await page.evaluate(() => {
      const selectors = [
        '[data-testid="chatlist-header"]',
        '[data-testid="conversation-panel-wrapper"]',
        '#side',
        '[data-testid="chat-list"]',
        '[aria-label*="Chat list"]'
      ];
      
      return selectors.some(selector => document.querySelector(selector) !== null);
    });

    isConnected = isLoggedIn;
    return isLoggedIn;
  } catch (error) {
    console.error("Error checking connection status:", error);
    isConnected = false;
    return false;
  }
}

export async function getUserInfo(): Promise<{ name: string; phone: string } | null> {
  if (!isConnected || !page) {
    return null;
  }

  if (userInfo) {
    return userInfo;
  }

  try {
    const info = await page.evaluate(() => {
      const selectors = [
        '[data-testid="chatlist-header"] span[title]',
        'header span[title]',
        '#side header span[title]',
        '[aria-label*="Profile"]'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const title = element.getAttribute('title');
          if (title) {
            return { name: title, phone: '' };
          }
        }
      }
      
      return { name: 'کاربر واتساپ', phone: '' };
    });

    userInfo = info;
    return info;
  } catch (error) {
    console.error("Error getting user info:", error);
    return { name: 'کاربر واتساپ', phone: '' };
  }
}

export async function waitForLogin(): Promise<void> {
  if (!page) {
    throw new Error("Page not initialized");
  }

  console.log("Waiting for user to scan QR code...");
  
  try {
    await page.waitForFunction(
      () => {
        const qrCode = document.querySelector('canvas[aria-label*="Scan"]');
        if (qrCode) return false;
        
        const selectors = [
          '[data-testid="chatlist-header"]',
          '[data-testid="conversation-panel-wrapper"]',
          '#side',
          '[data-testid="chat-list"]',
          '[aria-label*="Chat list"]',
          'div[role="application"]'
        ];
        
        return selectors.some(selector => document.querySelector(selector) !== null);
      },
      { timeout: 120000, polling: 1000 }
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    isConnected = true;
    console.log("User logged in successfully!");
    
    await getUserInfo();
  } catch (error) {
    console.error("Login timeout or error:", error);
    throw error;
  }
}

export async function disconnect(): Promise<void> {
  isConnected = false;
  userInfo = null;
  
  if (page) {
    try {
      await page.goto("https://web.whatsapp.com/", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.reload({ waitUntil: "domcontentloaded" });
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }
}

export function getConnectionStatus(): boolean {
  return isConnected;
}

export async function closeBrowser() {
  isConnected = false;
  userInfo = null;
  
  if (page) {
    await page.close();
    page = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
}

process.on("SIGINT", async () => {
  await closeBrowser();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeBrowser();
  process.exit(0);
});
