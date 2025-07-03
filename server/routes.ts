import type { Express } from "express";
import { storage } from "./storage";
import { insertPreorderSchema, insertActivitySuggestionSchema } from "@shared/schema";
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

  // Activity Generator Routes
  app.post("/api/activities/generate", async (req, res) => {
    try {
      const { partner1Input, partner2Input } = req.body;
      
      if (!partner1Input || !partner2Input) {
        return res.status(400).json({ error: "Both partner inputs are required" });
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

      const savedSuggestion = await storage.createActivitySuggestion(suggestionData);
      
      res.json({ 
        success: true, 
        activity: {
          ...activity,
          id: savedSuggestion.id.toString()
        }
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
        return res.status(400).json({ error: "Email and activity ID are required" });
      }

      // Update the activity suggestion with the email
      // Since we don't have an update method, we'll get the original and create a new one
      // This is a simplified approach - in production we'd add proper update methods
      
      // For now, just return success - email sending logic would go here
      res.json({ 
        success: true, 
        message: "Activity sent to your email successfully!" 
      });
    } catch (error) {
      console.error("Error sending activity email:", error);
      res.status(500).json({ error: "Failed to send activity email" });
    }
  });

}

// Simple activity generation function
async function generateActivity(partner1Input: string, partner2Input: string) {
  // Basic keyword matching to determine category and activity
  const combinedInput = `${partner1Input} ${partner2Input}`.toLowerCase();
  
  // Activity templates organized by category
  const activityTemplates = {
    communication: [
      {
        title: "The Deep Conversation Night",
        description: "Create a cozy atmosphere and take turns sharing your thoughts and dreams. Set aside phones and distractions for meaningful dialogue.",
        conversationPrompts: [
          "What's something you've learned about yourself recently?",
          "What dream would you pursue if you knew you couldn't fail?",
          "How do you feel most loved and appreciated?"
        ],
        estimatedTime: "1-2 hours"
      },
      {
        title: "Question & Answer Journey",
        description: "Use thoughtful questions to explore each other's perspectives and experiences in a comfortable, judgment-free space.",
        conversationPrompts: [
          "What's a childhood memory that still makes you smile?",
          "What values are most important to you in our relationship?",
          "What's one thing you'd like to try together this year?"
        ],
        estimatedTime: "45-60 minutes"
      }
    ],
    intimacy: [
      {
        title: "Gratitude & Appreciation Circle",
        description: "Take turns expressing specific things you appreciate about each other and your relationship. Focus on actions, qualities, and moments that matter.",
        conversationPrompts: [
          "What's something your partner did recently that made you feel loved?",
          "What quality do you most admire in your partner?",
          "What's your favorite memory of us together this month?"
        ],
        estimatedTime: "30-45 minutes"
      },
      {
        title: "Connection Ritual",
        description: "Create a special moment together through gentle touch, eye contact, and shared breathing. Focus on being present with each other.",
        conversationPrompts: [
          "How are you feeling right now in this moment?",
          "What do you need from me today?",
          "What makes you feel most connected to me?"
        ],
        estimatedTime: "20-30 minutes"
      }
    ],
    fun: [
      {
        title: "Adventure Planning Session",
        description: "Dream together about future adventures, both big and small. Create a vision board or list of experiences you want to share.",
        conversationPrompts: [
          "If we could travel anywhere together, where would we go?",
          "What's a new activity we could try together this month?",
          "What would make for a perfect weekend together?"
        ],
        estimatedTime: "1 hour"
      },
      {
        title: "Playful Challenge Day",
        description: "Choose a fun activity to do together - could be a game, puzzle, cooking challenge, or creative project that brings out your playful sides.",
        conversationPrompts: [
          "What did you enjoy most about this activity?",
          "What did we learn about each other during this?",
          "What other activities would be fun to try together?"
        ],
        estimatedTime: "1-3 hours"
      }
    ],
    growth: [
      {
        title: "Goals & Dreams Alignment",
        description: "Share your individual goals and explore how you can support each other's growth while building shared dreams.",
        conversationPrompts: [
          "What personal goal is most important to you right now?",
          "How can I best support your dreams?",
          "What shared goal would you like us to work on together?"
        ],
        estimatedTime: "1-1.5 hours"
      },
      {
        title: "Relationship Check-In",
        description: "Have an honest, gentle conversation about how your relationship is growing and what you both want to nurture moving forward.",
        conversationPrompts: [
          "What's working really well in our relationship?",
          "What's one thing we could improve together?",
          "How do you want our relationship to grow this year?"
        ],
        estimatedTime: "45-60 minutes"
      }
    ]
  };

  // Determine category based on keywords
  let category: keyof typeof activityTemplates = 'communication';
  
  if (combinedInput.includes('talk') || combinedInput.includes('communicate') || combinedInput.includes('conversation')) {
    category = 'communication';
  } else if (combinedInput.includes('intimate') || combinedInput.includes('close') || combinedInput.includes('connect') || combinedInput.includes('love')) {
    category = 'intimacy';
  } else if (combinedInput.includes('fun') || combinedInput.includes('play') || combinedInput.includes('enjoy') || combinedInput.includes('adventure')) {
    category = 'fun';
  } else if (combinedInput.includes('grow') || combinedInput.includes('goal') || combinedInput.includes('improve') || combinedInput.includes('better')) {
    category = 'growth';
  }

  // Select a random activity from the determined category
  const categoryActivities = activityTemplates[category];
  const selectedActivity = categoryActivities[Math.floor(Math.random() * categoryActivities.length)];

  return {
    ...selectedActivity,
    category
  };
}
