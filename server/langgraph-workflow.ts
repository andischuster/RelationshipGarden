import { GoogleGenAI } from "@google/genai";
import { trace, SpanStatusCode } from "@opentelemetry/api";

// Initialize tracer for activity generation instrumentation
const tracer = trace.getTracer('relationship-activity-generator', '1.0.0');

// Initialize Gemini client
let genai: GoogleGenAI;

function initializeClients() {
  if (!genai) {
    genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }
}

// Simple fallback function
function getFallbackActivity() {
  return {
    title: "Connection Time",
    description: "Spend quality time discussing your thoughts and feelings together in a comfortable space.",
    conversationPrompts: [
      "What's something new you'd like to try together?",
      "How can we better support each other's goals?",
      "What's one thing you appreciate about our relationship?"
    ],
    category: "communication",
    estimatedTime: "30 minutes",
    difficultyLevel: "easy",
    materials: null,
    activityType: "foundation_strengthening"
  };
}

// SIMPLIFIED: Single function that does everything with just one API call
export async function generateActivityWithLangGraph(
  partner1Input: string, 
  partner2Input: string
): Promise<any> {
  return await tracer.startActiveSpan(
    "activity-generation",
    {
      attributes: {
        "openinference.span.kind": "LLM",
        "llm.model_name": "gemini-2.5-flash",
        "llm.provider": "google",
        "session.id": `session-${Date.now()}`,
        "input.partner1_length": partner1Input.length,
        "input.partner2_length": partner2Input.length,
        // Agent metadata for Arize
        "graph.node.id": "activity_generator",
        "graph.node.display_name": "Activity Generator",
      },
    },
    async (span) => {
      try {
        initializeClients();
        
        console.log("🚀 Starting activity generation...");
        
        // SINGLE PROMPT - analyze inputs AND generate activity in one call
        const prompt = `Generate a relationship activity for these partners:

Partner 1: "${partner1Input}"
Partner 2: "${partner2Input}"

Analyze their interests, find compatibility, and create ONE personalized activity.

Return valid JSON:
{
  "title": "Activity Name (10-25 chars)",
  "description": "Brief description of what to do",
  "conversationPrompts": [
    "First conversation starter question",
    "Second conversation starter question", 
    "Third conversation starter question"
  ],
  "category": "communication|adventure|creative|relaxation",
  "estimatedTime": "30 minutes",
  "difficultyLevel": "easy|medium|hard",
  "materials": null,
  "activityType": "foundation_strengthening"
}

Keep title short, include exactly 3 conversation prompts, make it relevant to both partners.`;

        try {
          const response = await genai.models.generateContent({
            model: "gemini-2.5-flash",
            config: { responseMimeType: "application/json" },
            contents: prompt,
          });

          const responseText = response.text;
          if (!responseText) {
            throw new Error("No response from Gemini API");
          }
          
          const activity = JSON.parse(responseText);
          
          // Basic validation - use fallback if invalid
          if (!activity.title || !activity.conversationPrompts || activity.conversationPrompts.length !== 3) {
            console.log("⚠️ Generated activity missing required fields, using fallback");
            span.setAttributes({
              "validation.failed": true,
              "fallback.used": true,
            });
            return getFallbackActivity();
          }

          span.setAttributes({
            "output.activity_title": activity.title,
            "output.activity_category": activity.category,
            "llm.response_length": responseText.length,
            "validation.passed": true,
          });
          
          console.log(`✅ Activity generated: ${activity.title}`);
          span.setStatus({ code: SpanStatusCode.OK });
          return activity;
          
        } catch (apiError: any) {
          console.log(`⚠️ Gemini API failed (${apiError.message}), using fallback`);
          span.setAttributes({
            "api.error": apiError.message,
            "fallback.used": true,
          });
          span.setStatus({ code: SpanStatusCode.ERROR });
          return getFallbackActivity();
        }
        
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Activity generation failed:", error);
        return getFallbackActivity();
      } finally {
        span.end();
      }
    }
  );
} 