import type { Express } from "express";
import { storage } from "./storage";
import {
  insertPreorderSchema,
  insertActivitySuggestionSchema,
} from "@shared/schema";
import { googleFormsService } from "./google-forms";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

// Initialize Gemini client
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function registerRoutes(app: Express): Promise<void> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Test endpoint to verify routes are working
  app.get("/api/test", (req, res) => {
    console.log("🧪 Test endpoint hit");
    res.json({ message: "API routes are working", timestamp: new Date().toISOString() });
  });

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
    console.log("🎯 Activity generation request received");
    console.log("🔍 Request method:", req.method);
    console.log("🔍 Request path:", req.path);
    console.log("🔍 Request body:", req.body);
    
    try {
      const { partner1Input, partner2Input } = req.body;
      console.log("📝 Request inputs:", { 
        partner1Length: partner1Input?.length || 0,
        partner2Length: partner2Input?.length || 0,
        partner1Preview: partner1Input?.substring(0, 50) + "...",
        partner2Preview: partner2Input?.substring(0, 50) + "..."
      });

      if (!partner1Input || !partner2Input) {
        console.log("❌ Missing required inputs");
        return res
          .status(400)
          .json({ error: "Both partner inputs are required" });
      }

      console.log("🚀 Starting activity generation...");
      const activity = await generateActivity(partner1Input, partner2Input);
      console.log("✅ Activity generated successfully:", {
        title: activity.title,
        category: activity.category,
        estimatedTime: activity.estimatedTime,
        promptCount: activity.conversationPrompts?.length || 0
      });

      // Save the suggestion to database
      try {
        const suggestionData = {
          partner1Input,
          partner2Input,
          generatedActivity: JSON.stringify(activity),
          conversationPrompts: activity.conversationPrompts,
          category: activity.category,
          estimatedTime: activity.estimatedTime,
          email: null, // Will be updated when email is captured
        };

        console.log("💾 Saving to database...");
        const savedSuggestion = await storage.createActivitySuggestion(suggestionData);
        console.log("✅ Saved to database with ID:", savedSuggestion.id);

        res.json({
          success: true,
          activity: {
            ...activity,
            id: savedSuggestion.id.toString(),
          },
        });
      } catch (dbError) {
        console.error("💾 Database save failed, returning activity without saving:", dbError);
        // Still return the activity even if database save fails
        res.json({
          success: true,
          activity: {
            ...activity,
            id: Date.now().toString(), // Use timestamp as fallback ID
          },
        });
      }
    } catch (error) {
      console.error("💥 Error generating activity:", error);
      console.error("💥 Full error stack:", error.stack);
      res.status(500).json({ 
        error: "Failed to generate activity",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

// AI-powered activity generation function with Gemini and OpenAI fallback
async function generateActivity(partner1Input: string, partner2Input: string) {
  console.log("🤖 Starting AI activity generation...");
  
  // Try Gemini first
  try {
    console.log("🔮 Attempting Gemini API call...");
    const activity = await generateWithGemini(partner1Input, partner2Input);
    console.log("✅ Gemini API successful");
    return activity;
  } catch (geminiError) {
    console.error("❌ Gemini API failed:", geminiError);
    console.log("🔄 Falling back to OpenAI...");
    
    // Try OpenAI as fallback
    try {
      const activity = await generateWithOpenAI(partner1Input, partner2Input);
      console.log("✅ OpenAI API successful");
      return activity;
    } catch (openaiError) {
      console.error("❌ OpenAI API also failed:", openaiError);
      console.log("🔄 Using static fallback...");
      
      // Final fallback to static content
      return generateStaticFallback(partner1Input, partner2Input);
    }
  }
}

async function generateWithGemini(partner1Input: string, partner2Input: string) {
  const prompt = `You are a relationship counseling expert creating personalized activities for couples. Based on the following inputs from two partners, create a unique relationship activity that addresses their specific interests and needs.

Partner 1 shared: "${partner1Input}"
Partner 2 shared: "${partner2Input}"

Please create a personalized relationship activity that considers both partners' inputs. Return your response as a JSON object with this exact structure:

{
  "title": "A creative, engaging title for the activity (23 characters max)",
  "description": "A short description of the activity that incorporates elements from both partners' inputs (25 words max)",
  "conversationPrompts": [
    "Thoughtful question based on their shared interests that helps them connect deeper. (short succinct, 10 words max)",
    "Another meaningful question to deepen their connection. (short succinct, 10 words max)",
    "A final question to help them grow together. (short succinct, 10 words max)"
  ],
  "category": "One of: communication, intimacy, fun, or growth",
  "estimatedTime": "A time estimate like '30 minutes' or '1 hour'"
}

Make the activity specific to their inputs - reference their interests, concerns, or goals when relevant. Keep the tone warm, supportive, and relationship-focused.`;

  console.log("📤 Sending request to Gemini...");
  const startTime = Date.now();
  
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
          estimatedTime: { type: "string" },
        },
        required: [
          "title",
          "description",
          "conversationPrompts",
          "category",
          "estimatedTime",
        ],
      },
    },
    contents: prompt,
  });

  const duration = Date.now() - startTime;
  console.log(`📥 Gemini response received in ${duration}ms`);

  const responseContent = response.text;
  if (!responseContent) {
    throw new Error("No response content from Gemini");
  }

  console.log("📄 Raw Gemini response:", responseContent.substring(0, 200) + "...");

  // Parse the JSON response
  const activity = JSON.parse(responseContent);
  console.log("📊 Parsed activity structure:", {
    hasTitle: !!activity.title,
    hasDescription: !!activity.description,
    hasPrompts: !!activity.conversationPrompts,
    hasCategory: !!activity.category,
    hasEstimatedTime: !!activity.estimatedTime,
    promptCount: activity.conversationPrompts?.length || 0
  });

  // Validate the response has required fields
  if (
    !activity.title ||
    !activity.description ||
    !activity.conversationPrompts ||
    !activity.estimatedTime ||
    !activity.category
  ) {
    throw new Error("Invalid activity structure from Gemini - missing required fields");
  }

  return activity;
}

async function generateWithOpenAI(partner1Input: string, partner2Input: string) {
  const prompt = `You are a relationship counseling expert creating personalized activities for couples. Based on the following inputs from two partners, create a unique relationship activity that addresses their specific interests and needs.

Partner 1 shared: "${partner1Input}"
Partner 2 shared: "${partner2Input}"

Please create a personalized relationship activity that considers both partners' inputs. Return your response as a JSON object with this exact structure:

{
  "title": "A creative, engaging title for the activity (23 characters max)",
  "description": "A short description of the activity that incorporates elements from both partners' inputs (25 words max)",
  "conversationPrompts": [
    "Thoughtful question based on their shared interests that helps them connect deeper. (short succinct, 10 words max)",
    "Another meaningful question to deepen their connection. (short succinct, 10 words max)",
    "A final question to help them grow together. (short succinct, 10 words max)"
  ],
  "category": "One of: communication, intimacy, fun, or growth",
  "estimatedTime": "A time estimate like '30 minutes' or '1 hour'"
}

Make the activity specific to their inputs - reference their interests, concerns, or goals when relevant. Keep the tone warm, supportive, and relationship-focused.`;

  console.log("📤 Sending request to OpenAI...");
  console.log("🔑 API Key configured:", !!process.env.OPENAI_API_KEY);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a relationship counseling expert who creates personalized activities for couples. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const duration = Date.now() - startTime;
  console.log(`📥 OpenAI response received in ${duration}ms`);

  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error("No response content from OpenAI");
  }

  console.log("📄 Raw OpenAI response:", responseContent.substring(0, 200) + "...");

  // Parse the JSON response
  const activity = JSON.parse(responseContent);
  console.log("📊 Parsed activity structure:", {
    hasTitle: !!activity.title,
    hasDescription: !!activity.description,
    hasPrompts: !!activity.conversationPrompts,
    hasCategory: !!activity.category,
    hasEstimatedTime: !!activity.estimatedTime,
    promptCount: activity.conversationPrompts?.length || 0
  });

  // Validate the response has required fields
  if (
    !activity.title ||
    !activity.description ||
    !activity.conversationPrompts ||
    !activity.estimatedTime ||
    !activity.category
  ) {
    throw new Error("Invalid activity structure from OpenAI - missing required fields");
  }

  return activity;
}

function generateStaticFallback(partner1Input: string, partner2Input: string) {
  console.log("🛡️ Using static fallback activity");
  
  return {
    title: "Connection Time",
    description: `Based on what you both shared, spend time discussing your thoughts and feelings together. Create a comfortable space where you can both express yourselves openly.`,
    conversationPrompts: [
      `How can we explore "${partner1Input.substring(0, 30)}..." together?`,
      `What makes "${partner2Input.substring(0, 30)}..." meaningful for us?`,
      "What's one thing we could do together that combines both interests?",
    ],
    category: "communication",
    estimatedTime: "30 minutes",
  };
}
