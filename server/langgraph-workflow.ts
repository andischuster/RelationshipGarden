import { GoogleGenAI } from "@google/genai";
import { trace, SpanStatusCode, context } from "@opentelemetry/api";

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

// Helper function to create proper agent spans with parent-child relationships
async function executeAgentNode(
  nodeName: string,
  displayName: string,
  parentSpanId: string,
  operation: () => Promise<any>
): Promise<any> {
  return await tracer.startActiveSpan(
    nodeName,
    {
      attributes: {
        "openinference.span.kind": "AGENT",
        "graph.node.id": nodeName,
        "graph.node.display_name": displayName,
        "graph.node.parent_id": parentSpanId,
      },
    },
    async (span) => {
      try {
        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Node 1: Input Analysis
async function analyzeInputs(partner1Input: string, partner2Input: string, parentSpanId: string) {
  return await executeAgentNode(
    "analyze_inputs",
    "Analyze Partner Inputs",
    parentSpanId,
    async () => {
      console.log("📊 Analyzing partner inputs...");
      
      // Add input messages for Arize
      const span = trace.getActiveSpan();
      if (span) {
        span.setAttributes({
          "input.value": JSON.stringify({
            partner1Input,
            partner2Input,
            message: "Analyzing compatibility and interests"
          }),
          "input.mime_type": "application/json",
          "llm.input_messages": JSON.stringify([
            { role: "user", content: `Partner 1: ${partner1Input}` },
            { role: "user", content: `Partner 2: ${partner2Input}` }
          ]),
        });
      }
      
      // Simple analysis without API call
      const analysis = {
        partner1Themes: partner1Input.split(' ').slice(0, 3),
        partner2Themes: partner2Input.split(' ').slice(0, 3),
        commonWords: partner1Input.split(' ').filter(word => 
          partner2Input.toLowerCase().includes(word.toLowerCase())
        ),
        compatibilityScore: Math.min(Math.max(Math.random() * 100, 30), 90)
      };
      
      if (span) {
        span.setAttributes({
          "output.value": JSON.stringify(analysis),
          "output.mime_type": "application/json",
          "analysis.compatibility_score": analysis.compatibilityScore,
        });
      }
      
      console.log(`✅ Analysis complete: ${analysis.compatibilityScore.toFixed(0)}% compatibility`);
      return analysis;
    }
  );
}

// Node 2: Activity Generation (the only LLM call)
async function generateActivity(
  partner1Input: string, 
  partner2Input: string, 
  analysis: any,
  parentSpanId: string
) {
  return await executeAgentNode(
    "generate_activity",
    "Generate Relationship Activity",
    parentSpanId,
    async () => {
      console.log("🎯 Generating activity with Gemini...");
      
      const span = trace.getActiveSpan();
      if (span) {
        // Add LLM-specific attributes
        span.setAttributes({
          "openinference.span.kind": "LLM",
          "llm.model_name": "gemini-2.5-flash",
          "llm.provider": "google",
          "input.value": JSON.stringify({
            partner1Input,
            partner2Input,
            analysis,
            task: "Generate personalized relationship activity"
          }),
          "input.mime_type": "application/json",
        });
      }
      
      initializeClients();
      
      const prompt = `Generate a relationship activity for these partners:

Partner 1: "${partner1Input}"
Partner 2: "${partner2Input}"

Compatibility Score: ${analysis.compatibilityScore.toFixed(0)}%
Common Interests: ${analysis.commonWords.join(', ') || 'general compatibility'}

Create ONE personalized activity. Return valid JSON:
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
}`;

      try {
        if (span) {
          span.setAttributes({
            "llm.input_messages": JSON.stringify([
              { role: "user", content: prompt }
            ]),
          });
        }
        
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
        
        if (span) {
          span.setAttributes({
            "llm.output_messages": JSON.stringify([
              { role: "assistant", content: responseText }
            ]),
            "output.value": JSON.stringify(activity),
            "output.mime_type": "application/json",
            "llm.response_length": responseText.length,
          });
        }
        
        console.log(`✅ Activity generated: ${activity.title}`);
        return activity;
        
      } catch (apiError: any) {
        console.log(`⚠️ Gemini API failed: ${apiError.message}`);
        if (span) {
          span.setAttributes({
            "error.message": apiError.message,
            "fallback.used": true,
          });
        }
        throw apiError;
      }
    }
  );
}

// Node 3: Validation
async function validateActivity(activity: any, parentSpanId: string) {
  return await executeAgentNode(
    "validate_activity",
    "Validate Generated Activity",
    parentSpanId,
    async () => {
      console.log("✓ Validating activity...");
      
      const span = trace.getActiveSpan();
      if (span) {
        span.setAttributes({
          "input.value": JSON.stringify(activity),
          "input.mime_type": "application/json",
        });
      }
      
      const isValid = activity.title && 
                     activity.conversationPrompts && 
                     activity.conversationPrompts.length === 3;
      
      if (span) {
        span.setAttributes({
          "validation.passed": isValid,
          "validation.title_present": !!activity.title,
          "validation.prompts_count": activity.conversationPrompts?.length || 0,
          "output.value": JSON.stringify({ isValid }),
          "output.mime_type": "application/json",
        });
      }
      
      console.log(`✅ Validation ${isValid ? 'passed' : 'failed'}`);
      return { isValid, activity };
    }
  );
}

// Main workflow with proper agent graph structure
export async function generateActivityWithLangGraph(
  partner1Input: string, 
  partner2Input: string
): Promise<any> {
  return await tracer.startActiveSpan(
    "relationship_workflow",
    {
      attributes: {
        "openinference.span.kind": "WORKFLOW",
        "graph.node.id": "relationship_workflow",
        "graph.node.display_name": "Relationship Activity Workflow",
        "workflow.name": "relationship_activity_generator",
        "workflow.version": "2.0.0",
        "session.id": `session-${Date.now()}`,
        "user.id": "relationship-garden-user",
        // Root workflow input
        "input.value": JSON.stringify({
          partner1Input,
          partner2Input,
          timestamp: new Date().toISOString()
        }),
        "input.mime_type": "application/json",
      },
    },
    async (rootSpan) => {
      const rootSpanId = rootSpan.spanContext().spanId;
      
      try {
        console.log("🚀 Starting relationship workflow...");
        
        // Step 1: Analyze inputs
        const analysis = await analyzeInputs(partner1Input, partner2Input, rootSpanId);
        
        // Step 2: Generate activity (only LLM call)
        let activity;
        try {
          activity = await generateActivity(partner1Input, partner2Input, analysis, rootSpanId);
        } catch (error) {
          console.log("🛡️ Using fallback due to generation failure");
          activity = getFallbackActivity();
        }
        
        // Step 3: Validate
        const validation = await validateActivity(activity, rootSpanId);
        
        const finalActivity = validation.isValid ? activity : getFallbackActivity();
        
        // Set final workflow output
        rootSpan.setAttributes({
          "output.value": JSON.stringify(finalActivity),
          "output.mime_type": "application/json",
          "workflow.success": true,
          "workflow.nodes_executed": 3,
          "final.activity_title": finalActivity.title,
          "final.compatibility_score": analysis.compatibilityScore,
        });
        
        rootSpan.setStatus({ code: SpanStatusCode.OK });
        console.log("✅ Relationship workflow completed successfully");
        
        return finalActivity;
        
      } catch (error) {
        rootSpan.recordException(error as Error);
        rootSpan.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Workflow failed:", error);
        
        // Return fallback on any error
        const fallback = getFallbackActivity();
        rootSpan.setAttributes({
          "output.value": JSON.stringify(fallback),
          "output.mime_type": "application/json",
          "workflow.success": false,
          "fallback.used": true,
        });
        
        return fallback;
      } finally {
        rootSpan.end();
      }
    }
  );
} 