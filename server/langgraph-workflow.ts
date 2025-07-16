import { StateGraph, START, END } from "@langchain/langgraph";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import { SemanticConventions as SC } from "@arizeai/openinference-semantic-conventions";

// Initialize tracer for LangGraph instrumentation
const tracer = trace.getTracer('langgraph-relationship-workflow', '1.0.0');

// Helper to add graph node metadata for Arize visualization
function annotateGraphNode(span: ReturnType<typeof trace.getTracer> extends infer T ? any : any, nodeId: string) {
  try {
    span.setAttribute("graph.node.id", nodeId);
    const parentSpan = trace.getSpan(context.active());
    if (parentSpan) {
      span.setAttribute("graph.node.parent_id", parentSpan.spanContext().spanId);
    }
  } catch (_) {
    // swallow errors to avoid breaking workflow
  }
}

// Define the state interface for our workflow
export interface WorkflowState {
  partner1Input: string;
  partner2Input: string;
  inputAnalysis?: {
    partner1Themes: string[];
    partner2Themes: string[];
    commonInterests: string[];
    potentialChallenges: string[];
  };
  compatibilityScore?: number;
  activityType?: string;
  rawActivity?: any;
  personalizedActivity?: any;
  validationResult?: {
    isValid: boolean;
    issues: string[];
    improvements: string[];
  };
  finalActivity?: any;
  error?: string;
  retryCount?: number;
}

// AI Clients (initialized lazily)
let genai: GoogleGenAI;
let openai: OpenAI;

function initializeClients() {
  if (!genai) {
    genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  }
}

// Step 1: Analyze Partner Inputs
async function analyzeInputs(state: WorkflowState): Promise<Partial<WorkflowState>> {
  return await tracer.startActiveSpan(
    "langgraph-analyze-inputs",
    {
      attributes: {
        "openinference.span.kind": "LLM",
        "llm.model_name": "gemini-2.5-flash",
        "llm.provider": "google",
        "workflow.step": "analyze_inputs",
        "session.id": `workflow-${Date.now()}`,
        "input.partner1_length": state.partner1Input.length,
        "input.partner2_length": state.partner2Input.length,
      },
    },
    async (span) => {
      annotateGraphNode(span, "analyze_inputs");
      try {
        initializeClients();
        
        const prompt = `Analyze these partner inputs for a relationship activity generator:

Partner 1: "${state.partner1Input}"
Partner 2: "${state.partner2Input}"

Extract key themes, interests, and potential compatibility factors. Return JSON:

{
  "partner1Themes": ["theme1", "theme2", ...],
  "partner2Themes": ["theme1", "theme2", ...],
  "commonInterests": ["interest1", "interest2", ...],
  "potentialChallenges": ["challenge1", "challenge2", ...]
}`;

        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          config: { responseMimeType: "application/json" },
          contents: prompt,
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response from Gemini API");
        }
        const analysis = JSON.parse(responseText);
        
        span.setAttributes({
          "output.partner1_themes_count": analysis.partner1Themes?.length || 0,
          "output.partner2_themes_count": analysis.partner2Themes?.length || 0,
          "output.common_interests_count": analysis.commonInterests?.length || 0,
          "output.challenges_count": analysis.potentialChallenges?.length || 0,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log("✅ Input analysis completed");
        
        return { inputAnalysis: analysis };
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Input analysis failed:", error);
        return { error: `Analysis failed: ${(error as Error).message}` };
      } finally {
        span.end();
      }
    }
  );
}

// Step 2: Calculate Compatibility Score
async function assessCompatibility(state: WorkflowState): Promise<Partial<WorkflowState>> {
  return await tracer.startActiveSpan(
    "langgraph-assess-compatibility",
    {
      attributes: {
        "workflow.step": "assess_compatibility",
        "input.common_interests": state.inputAnalysis?.commonInterests?.length || 0,
        "input.challenges": state.inputAnalysis?.potentialChallenges?.length || 0,
      },
    },
    async (span) => {
      annotateGraphNode(span, "assess_compatibility");
      try {
        if (!state.inputAnalysis) {
          throw new Error("No input analysis available");
        }

        const analysis = state.inputAnalysis;
        
        // Simple compatibility scoring algorithm
        let score = 50; // Base score
        
        // Add points for common interests
        score += Math.min(analysis.commonInterests.length * 15, 30);
        
        // Subtract points for potential challenges
        score -= Math.min(analysis.potentialChallenges.length * 10, 25);
        
        // Add points for theme overlap
        const themeOverlap = analysis.partner1Themes.filter(theme => 
          analysis.partner2Themes.some(t2 => t2.toLowerCase().includes(theme.toLowerCase()))
        ).length;
        score += themeOverlap * 10;
        
        // Ensure score is between 0-100
        const compatibilityScore = Math.max(0, Math.min(100, score));
        
        // Determine activity type based on score
        let activityType: string;
        if (compatibilityScore >= 80) activityType = "deep_connection";
        else if (compatibilityScore >= 60) activityType = "growth_focused";
        else if (compatibilityScore >= 40) activityType = "communication_building";
        else activityType = "foundation_strengthening";
        
        span.setAttributes({
          "output.compatibility_score": compatibilityScore,
          "output.activity_type": activityType,
          "calculation.theme_overlap": themeOverlap,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log(`✅ Compatibility assessed: ${compatibilityScore}% (${activityType})`);
        
        return { compatibilityScore, activityType };
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Compatibility assessment failed:", error);
        return { error: `Compatibility assessment failed: ${(error as Error).message}` };
      } finally {
        span.end();
      }
    }
  );
}

// Step 3: Generate Base Activity
async function generateActivity(state: WorkflowState): Promise<Partial<WorkflowState>> {
  return await tracer.startActiveSpan(
    "langgraph-generate-activity",
    {
      attributes: {
        "openinference.span.kind": "LLM",
        "llm.model_name": "gpt-4",
        "llm.provider": "openai",
        "workflow.step": "generate_activity",
        "input.activity_type": state.activityType || "unknown",
        "input.compatibility_score": state.compatibilityScore || 0,
      },
    },
    async (span) => {
      annotateGraphNode(span, "generate_activity");
      try {
        initializeClients();
        
        if (!state.inputAnalysis || !state.activityType) {
          throw new Error("Missing required analysis data");
        }

        const prompt = `Create a ${state.activityType} relationship activity based on this analysis:

Common Interests: ${state.inputAnalysis.commonInterests.join(", ")}
Partner 1 Themes: ${state.inputAnalysis.partner1Themes.join(", ")}
Partner 2 Themes: ${state.inputAnalysis.partner2Themes.join(", ")}
Compatibility Score: ${state.compatibilityScore}%
Activity Type: ${state.activityType}

Generate a JSON activity with this structure:
{
  "title": "Engaging title (max 25 chars)",
  "description": "Activity description (max 30 words)",
  "conversationPrompts": ["prompt1", "prompt2", "prompt3"],
  "category": "communication|intimacy|fun|growth", 
  "estimatedTime": "time estimate",
  "difficultyLevel": "easy|medium|challenging",
  "materials": ["item1", "item2"] or null,
  "activityType": "${state.activityType}"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are an expert relationship counselor. Return only valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const rawActivity = JSON.parse(response.choices[0]?.message?.content || "{}");
        
        span.setAttributes({
          "output.activity_title": rawActivity.title || "",
          "output.activity_category": rawActivity.category || "",
          "output.difficulty_level": rawActivity.difficultyLevel || "",
          "llm.token_count.total": response.usage?.total_tokens || 0,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log("✅ Base activity generated:", rawActivity.title);
        
        return { rawActivity };
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Activity generation failed:", error);
        return { error: `Activity generation failed: ${(error as Error).message}` };
      } finally {
        span.end();
      }
    }
  );
}

// Step 4: Personalize Activity
async function personalizeActivity(state: WorkflowState): Promise<Partial<WorkflowState>> {
  return await tracer.startActiveSpan(
    "langgraph-personalize-activity",
    {
      attributes: {
        "openinference.span.kind": "LLM",
        "llm.model_name": "gemini-2.5-flash",
        "llm.provider": "google",
        "workflow.step": "personalize_activity",
      },
    },
    async (span) => {
      annotateGraphNode(span, "personalize_activity");
      try {
        initializeClients();
        
        if (!state.rawActivity || !state.inputAnalysis) {
          throw new Error("Missing activity or analysis data");
        }

        const prompt = `Personalize this relationship activity based on the original partner inputs:

Base Activity: ${JSON.stringify(state.rawActivity)}

Original Inputs:
Partner 1: "${state.partner1Input}"
Partner 2: "${state.partner2Input}"

Add personal touches that reference their specific interests, goals, or situations. Modify conversation prompts to be more specific to their inputs. Keep the same JSON structure but enhance with personalization.`;

        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          config: { responseMimeType: "application/json" },
          contents: prompt,
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response from Gemini API");
        }
        const personalizedActivity = JSON.parse(responseText);
        
        span.setAttributes({
          "output.personalized_title": personalizedActivity.title || "",
          "personalization.applied": true,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log("✅ Activity personalized");
        
        return { personalizedActivity };
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Personalization failed:", error);
        // Fallback to raw activity if personalization fails
        return { personalizedActivity: state.rawActivity };
      } finally {
        span.end();
      }
    }
  );
}

// Step 5: Validate Activity
async function validateActivity(state: WorkflowState): Promise<Partial<WorkflowState>> {
  return await tracer.startActiveSpan(
    "langgraph-validate-activity",
    {
      attributes: {
        "workflow.step": "validate_activity",
      },
    },
    async (span) => {
      annotateGraphNode(span, "validate_activity");
      try {
        if (!state.personalizedActivity) {
          throw new Error("No activity to validate");
        }

        const activity = state.personalizedActivity;
        const issues: string[] = [];
        const improvements: string[] = [];

        // Validation checks
        if (!activity.title || activity.title.length > 25) {
          issues.push("Title missing or too long");
        }
        
        if (!activity.description || activity.description.split(' ').length > 30) {
          issues.push("Description missing or too long");
        }
        
        if (!activity.conversationPrompts || activity.conversationPrompts.length !== 3) {
          issues.push("Must have exactly 3 conversation prompts");
        }
        
        if (!["communication", "intimacy", "fun", "growth"].includes(activity.category)) {
          issues.push("Invalid category");
        }

        // Quality improvements
        if (activity.conversationPrompts?.some((p: string) => p.split(' ').length > 12)) {
          improvements.push("Some prompts are too long");
        }

        const isValid = issues.length === 0;
        const validationResult = { isValid, issues, improvements };

        span.setAttributes({
          "validation.is_valid": isValid,
          "validation.issues_count": issues.length,
          "validation.improvements_count": improvements.length,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log(`✅ Validation completed - Valid: ${isValid}`);
        
        return { 
          validationResult,
          finalActivity: isValid ? activity : null 
        };
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ Validation failed:", error);
        return { error: `Validation failed: ${(error as Error).message}` };
      } finally {
        span.end();
      }
    }
  );
}

// Conditional edge function
function shouldRetry(state: WorkflowState): string {
  const retryCount = state.retryCount || 0;
  const hasError = !!state.error;
  const isInvalid = state.validationResult && !state.validationResult.isValid;
  
  if ((hasError || isInvalid) && retryCount < 2) {
    console.log(`🔄 Retrying workflow (attempt ${retryCount + 1})`);
    return "retry";
  }
  
  if (state.finalActivity) {
    return "success";
  }
  
  return "fallback";
}

// Retry handler
async function handleRetry(state: WorkflowState): Promise<Partial<WorkflowState>> {
  return {
    retryCount: (state.retryCount || 0) + 1,
    error: undefined, // Clear error for retry
    validationResult: undefined,
  };
}

// Fallback handler
async function generateFallback(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log("🛡️ Using fallback activity generation");
  
  const fallbackActivity = {
    title: "Connection Time",
    description: "Spend quality time discussing your thoughts and feelings together in a comfortable space.",
    conversationPrompts: [
      `How can we explore your interests together?`,
      `What goals do we both want to work toward?`,
      "What's one thing we could try as a couple?",
    ],
    category: "communication",
    estimatedTime: "30 minutes",
    difficultyLevel: "easy",
    materials: null,
    activityType: "foundation_strengthening"
  };

  return { finalActivity: fallbackActivity };
}

// Create the LangGraph workflow
export function createRelationshipWorkflow() {
  const workflow = new StateGraph({
    channels: {
      partner1Input: { reducer: (x: string, y?: string) => y ?? x },
      partner2Input: { reducer: (x: string, y?: string) => y ?? x },
      inputAnalysis: { reducer: (x: any, y?: any) => y ?? x },
      compatibilityScore: { reducer: (x: number, y?: number) => y ?? x },
      activityType: { reducer: (x: string, y?: string) => y ?? x },
      rawActivity: { reducer: (x: any, y?: any) => y ?? x },
      personalizedActivity: { reducer: (x: any, y?: any) => y ?? x },
      validationResult: { reducer: (x: any, y?: any) => y ?? x },
      finalActivity: { reducer: (x: any, y?: any) => y ?? x },
      error: { reducer: (x: string, y?: string) => y ?? x },
      retryCount: { reducer: (x: number, y?: number) => y ?? x },
    },
  });

  // Add nodes
  workflow.addNode("analyze_inputs", analyzeInputs);
  workflow.addNode("assess_compatibility", assessCompatibility);
  workflow.addNode("generate_activity", generateActivity);
  workflow.addNode("personalize_activity", personalizeActivity);
  workflow.addNode("validate_activity", validateActivity);
  workflow.addNode("retry", handleRetry);
  workflow.addNode("fallback", generateFallback);

  // Add edges
  workflow.addEdge(START, "analyze_inputs");
  workflow.addEdge("analyze_inputs", "assess_compatibility");
  workflow.addEdge("assess_compatibility", "generate_activity");
  workflow.addEdge("generate_activity", "personalize_activity");
  workflow.addEdge("personalize_activity", "validate_activity");
  
  // Conditional edges
  workflow.addConditionalEdges("validate_activity", shouldRetry, {
    retry: "retry",
    success: END,
    fallback: "fallback",
  });
  
  workflow.addEdge("retry", "generate_activity");
  workflow.addEdge("fallback", END);

  return workflow.compile();
}

// Main export function for use in routes
export async function generateActivityWithLangGraph(
  partner1Input: string, 
  partner2Input: string
): Promise<any> {
  return await tracer.startActiveSpan(
    "langgraph-relationship-workflow",
    {
      attributes: {
        "workflow.name": "relationship_activity_generator",
        "workflow.version": "1.0.0",
        "session.id": `workflow-session-${Date.now()}`,
        "user.id": "relationship-garden-user",
      },
    },
    async (span) => {
      try {
        const workflow = createRelationshipWorkflow();
        const initialState: WorkflowState = {
          partner1Input,
          partner2Input,
          retryCount: 0,
        };

        console.log("🚀 Starting LangGraph workflow...");
        const result = await workflow.invoke(initialState);
        
        if (!result.finalActivity) {
          throw new Error("Workflow failed to generate activity");
        }

        span.setAttributes({
          "workflow.success": true,
          "output.activity_title": result.finalActivity.title,
          "output.compatibility_score": result.compatibilityScore || 0,
          "output.retry_count": result.retryCount || 0,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log("✅ LangGraph workflow completed successfully");
        
        return result.finalActivity;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ LangGraph workflow failed:", error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
} 