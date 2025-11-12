import puppeteer, { Browser, Page } from "puppeteer";
import { execSync } from "child_process";

let browser: Browser | null = null;
let page: Page | null = null;

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

export async function closeBrowser() {
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
