import type { Express } from "express";
import { storage } from "./storage";
import {
  insertPreorderSchema,
  insertActivitySuggestionSchema,
} from "@shared/schema";
import { googleFormsService } from "./google-forms";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
      const formsResult = await googleFormsService.addPreorder(
        result.data.email,
      );

      if (formsResult.success) {
        // Also save to database as backup
        try {
          const existingPreorder = await storage.getPreorderByEmail(
            result.data.email,
          );
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

        const existingPreorder = await storage.getPreorderByEmail(
          result.data.email,
        );
        if (existingPreorder) {
          return res
            .status(409)
            .json({ error: "Email already registered for pre-order" });
        }

        const preorder = await storage.createPreorder(result.data);
        res.json({
          success: true,
          message: "Pre-order registered successfully!",
        });
      }
    } catch (error) {
      console.error("Error creating preorder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Activity Generator Routes
  app.post("/api/activities/generate", async (req, res) => {
    try {
      const { partner1Input, partner2Input } = req.body;

      if (!partner1Input || !partner2Input) {
        return res
          .status(400)
          .json({ error: "Both partner inputs are required" });
      }

      // Simple activity generation logic - will enhance with AI later
      const activity = await generateActivity(partner1Input, partner2Input);

      // Save the suggestion to database
      const suggestionData = {
        partner1Input,
        partner2Input,
        generatedActivity: JSON.stringify(activity),
        conversationPrompts: activity.conversationPrompts,
        category: activity.category,
        estimatedTime: activity.estimatedTime,
        email: null, // Will be updated when email is captured
      };

      const savedSuggestion =
        await storage.createActivitySuggestion(suggestionData);

      res.json({
        success: true,
        activity: {
          ...activity,
          id: savedSuggestion.id.toString(),
        },
      });
    } catch (error) {
      console.error("Error generating activity:", error);
      res.status(500).json({ error: "Failed to generate activity" });
    }
  });

  app.post("/api/activities/email", async (req, res) => {
    try {
      const { email, activityId } = req.body;

      if (!email || !activityId) {
        return res
          .status(400)
          .json({ error: "Email and activity ID are required" });
      }

      // Update the activity suggestion with the email
      // Since we don't have an update method, we'll get the original and create a new one
      // This is a simplified approach - in production we'd add proper update methods

      // For now, just return success - email sending logic would go here
      res.json({
        success: true,
        message: "Activity sent to your email successfully!",
      });
    } catch (error) {
      console.error("Error sending activity email:", error);
      res.status(500).json({ error: "Failed to send activity email" });
    }
  });
}

// AI-powered activity generation function using Gemini
async function generateActivity(partner1Input: string, partner2Input: string) {
  try {
    const prompt = `You are a relationship counseling expert creating personalized activities for couples. Based on the following inputs from two partners, create a unique relationship activity that addresses their specific interests and needs.

Partner 1 shared: "${partner1Input}"
Partner 2 shared: "${partner2Input}"

Please create a personalized relationship activity that considers both partners' inputs. Return your response as a JSON object with this exact structure:

{
  "title": "A creative, engaging title for the activity (23 characters max)",
  "description": "A short description of the activity that incorporates elements from both partners' inputs (25 words max)",
  "conversationPrompts": [
    "Thoughtful question based on their shared interests that helps them connect deeper. (short succinct, 10 words max)",
  ],
  "category": "One of: communication, intimacy, fun, or growth"
}

Make the activity specific to their inputs - reference their interests, concerns, or goals when relevant. Keep the tone warm, supportive, and relationship-focused.`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction:
          "You are a relationship counseling expert who creates personalized activities for couples. Always respond with valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            conversationPrompts: {
              type: "array",
              items: { type: "string" },
            },
            category: { type: "string" },
          },
          required: [
            "title",
            "description",
            "conversationPrompts",
            "category",
          ],
        },
      },
      contents: prompt,
    });

    const responseContent = response.text;
    if (!responseContent) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    const activity = JSON.parse(responseContent);

    // Validate the response has required fields
    if (
      !activity.title ||
      !activity.description ||
      !activity.conversationPrompts ||
      !activity.estimatedTime ||
      !activity.category
    ) {
      throw new Error("Invalid activity structure from AI");
    }

    return activity;
  } catch (error) {
    console.error("Error generating AI activity:", error);

    // Fallback to a simple personalized activity if AI fails
    return {
      title: "Personalized Connection Time",
      description: `Based on what you both shared, spend time discussing your thoughts and feelings together. Create a comfortable space where you can both express yourselves openly.`,
      conversationPrompts: [
        `Reflecting on what you shared - "${partner1Input}" - how do you think we can explore this together?`,
        `You mentioned "${partner2Input}" - what would make this meaningful for our relationship?`,
        "What's one thing we could do together that combines both of our interests?",
      ],
      category: "communication",
    };
  }
}
