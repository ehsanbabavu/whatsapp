import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getWhatsAppQR } from "./whatsapp";

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

  const httpServer = createServer(app);

  return httpServer;
}
