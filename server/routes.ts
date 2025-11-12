import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  getWhatsAppQR, 
  checkConnectionStatus, 
  getUserInfo, 
  waitForLogin,
  disconnect,
  getConnectionStatus 
} from "./whatsapp";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/whatsapp/qr", async (req, res) => {
    try {
      console.log("Fetching WhatsApp QR code...");
      const qrImage = await getWhatsAppQR();
      
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(qrImage);
      
      console.log("QR code sent successfully");
    } catch (error) {
      console.error("Error getting QR code:", error);
      res.status(500).json({ 
        error: "Failed to get QR code",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/whatsapp/status", async (req, res) => {
    try {
      const connected = await checkConnectionStatus();
      res.json({ connected });
    } catch (error) {
      console.error("Error checking status:", error);
      res.status(500).json({ 
        error: "Failed to check status",
        connected: false
      });
    }
  });

  app.get("/api/whatsapp/user", async (req, res) => {
    try {
      const connected = getConnectionStatus();
      if (!connected) {
        res.status(401).json({ error: "Not connected" });
        return;
      }

      const info = await getUserInfo();
      if (!info) {
        res.status(404).json({ error: "User info not available" });
        return;
      }

      res.json(info);
    } catch (error) {
      console.error("Error getting user info:", error);
      res.status(500).json({ 
        error: "Failed to get user info",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/whatsapp/disconnect", async (req, res) => {
    try {
      await disconnect();
      res.json({ success: true, message: "Disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting:", error);
      res.status(500).json({ 
        error: "Failed to disconnect",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/whatsapp/wait-login", async (req, res) => {
    try {
      await waitForLogin();
      const info = await getUserInfo();
      res.json({ success: true, userInfo: info });
    } catch (error) {
      console.error("Error waiting for login:", error);
      res.status(500).json({ 
        error: "Login timeout or failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
