import type { Express } from "express";
import { storage } from "./storage";
import { insertPreorderSchema } from "@shared/schema";
import { googleSheetsService } from "./google-sheets";

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

      // Use Google Sheets service
      const response = await googleSheetsService.addPreorder(result.data.email);
      
      if (response.success) {
        res.json({ success: true, message: response.message });
      } else {
        const statusCode = response.message.includes("already registered") ? 409 : 500;
        res.status(statusCode).json({ error: response.message });
      }
    } catch (error) {
      console.error("Error creating preorder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/preorders", async (req, res) => {
    try {
      const emails = await googleSheetsService.getPreorders();
      const preorders = emails.map((email, index) => ({
        id: index + 1,
        email,
        createdAt: new Date().toISOString() // Sheets will have timestamp in second column
      }));
      
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
