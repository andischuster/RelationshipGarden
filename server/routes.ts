import type { Express } from "express";
import { storage } from "./storage";
import { insertPreorderSchema } from "@shared/schema";
import { googleFormsService } from "./google-forms";

export async function registerRoutes(app: Express): Promise<void> {
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

      // Try Google Forms first
      const formsResult = await googleFormsService.addPreorder(result.data.email);
      
      if (formsResult.success) {
        // Also save to database as backup
        try {
          const existingPreorder = await storage.getPreorderByEmail(result.data.email);
          if (!existingPreorder) {
            await storage.createPreorder(result.data);
          }
        } catch (dbError) {
          console.log("Database backup failed:", dbError);
        }
        
        return res.json({ success: true, message: formsResult.message });
      } else {
        // Fallback to database
        console.log("Google Forms failed, using database fallback");
        
        const existingPreorder = await storage.getPreorderByEmail(result.data.email);
        if (existingPreorder) {
          return res.status(409).json({ error: "Email already registered for pre-order" });
        }

        const preorder = await storage.createPreorder(result.data);
        res.json({ success: true, message: "Pre-order registered successfully!" });
      }
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

}
