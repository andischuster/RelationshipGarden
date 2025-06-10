import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPreorderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.post("/api/preorders", async (req, res) => {
    try {
      const result = insertPreorderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check if email already exists
      const existingPreorder = await storage.getPreorderByEmail(result.data.email);
      if (existingPreorder) {
        return res.status(409).json({ error: "Email already registered for pre-order" });
      }

      const preorder = await storage.createPreorder(result.data);
      res.json({ success: true, message: "Pre-order registered successfully!" });
    } catch (error) {
      console.error("Error creating preorder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/preorders", async (req, res) => {
    try {
      const preorders = await storage.getAllPreorders();
      res.json({
        success: true,
        data: preorders,
        count: preorders.length
      });
    } catch (error) {
      console.error("Error fetching preorders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
