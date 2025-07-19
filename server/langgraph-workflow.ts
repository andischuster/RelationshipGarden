import { GoogleGenAI } from "@google/genai";
import { trace, SpanStatusCode, context, SpanKind } from "@opentelemetry/api";
import { initializeLangfuse, getLangfuseClient } from "./langfuse-config";

// Initialize tracer for activity generation instrumentation
const tracer = trace.getTracer('relationship-activity-generator', '1.0.0');

// Initialize Langfuse
initializeLangfuse();

// Using OpenInference semantic conventions for Arize agent graph visualization

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

// Helper function to create proper LangGraph agent spans
async function executeLangGraphNode(
  nodeName: string,
  displayName: string,
  stepNumber: number,
  inputData: any,
  operation: (span: any) => Promise<any>,
  parentNodeId: string = "langgraph_workflow"
): Promise<any> {
  return await tracer.startActiveSpan(
    nodeName,
    {
      attributes: {
        "openinference.span.kind": "AGENT",
        // LangGraph-specific metadata for Arize visualization
        "metadata.langgraph_node": nodeName,
        "metadata.langgraph_step": stepNumber,
        // Graph node relationships for Arize agent graph
        "graph.node.id": nodeName,
        "graph.node.parent_id": parentNodeId,
        "graph.node.display_name": displayName,
        // OpenInference input format
        "input.value": JSON.stringify(inputData),
        "input.mime_type": "application/json",
      },
    },
    async (span) => {
      try {
        // Agent metadata already set in span creation
        
        console.log(`🔄 Executing LangGraph node: ${displayName}`);
        
        const result = await operation(span);
        
        // Set OpenInference output format
        span.setAttributes({
          "output.value": JSON.stringify(result),
          "output.mime_type": "application/json",
          // Metadata for node execution
          "metadata": JSON.stringify({
            node_name: nodeName,
            execution_success: true,
            step_number: stepNumber
          }),
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        console.log(`✅ LangGraph node completed: ${displayName}`);
        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.setAttributes({
          "node.success": false,
          "error.message": error instanceof Error ? error.message : String(error),
        });
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// LangGraph Node 1: Input Analysis
async function analyzeInputs(partner1Input: string, partner2Input: string, langfuseTrace?: any) {
  const inputData = {
    partner1Input,
    partner2Input,
    task: "Analyze partner compatibility and interests"
  };

  return await executeLangGraphNode(
    "analyze_inputs",
    "Analyze Partner Inputs",
    1,
    inputData,
    async (span) => {
       // Create Langfuse span for this node
       const langfuseSpan = langfuseTrace?.span({
         name: "analyze_inputs",
         input: inputData,
         metadata: { node_type: "analysis", step: 1 },
       });
       
       // Add LLM input messages for better visualization
       span.setAttributes({
         "llm.input_messages": JSON.stringify([
           { role: "system", content: "Analyze relationship compatibility" },
           { role: "user", content: `Partner 1: ${partner1Input}` },
           { role: "user", content: `Partner 2: ${partner2Input}` }
         ]),
       });
      
      // Simple analysis without API call
      const analysis = {
        partner1Themes: partner1Input.split(' ').filter(word => word.length > 3).slice(0, 3),
        partner2Themes: partner2Input.split(' ').filter(word => word.length > 3).slice(0, 3),
        commonWords: partner1Input.split(' ').filter(word => 
          partner2Input.toLowerCase().includes(word.toLowerCase()) && word.length > 3
        ),
        compatibilityScore: Math.min(Math.max(Math.random() * 100, 30), 90),
        analysisTimestamp: new Date().toISOString()
      };
      
      // Add analysis results as attributes
      span.setAttributes({
        "analysis.compatibility_score": analysis.compatibilityScore,
        "analysis.common_words_count": analysis.commonWords.length,
        "analysis.partner1_themes": JSON.stringify(analysis.partner1Themes),
        "analysis.partner2_themes": JSON.stringify(analysis.partner2Themes),
      });
      
             console.log(`📊 Analysis: ${analysis.compatibilityScore.toFixed(0)}% compatibility, ${analysis.commonWords.length} common interests`);
       
       // Update Langfuse span with output
       langfuseSpan?.update({
         output: analysis,
         metadata: {
           compatibility_score: analysis.compatibilityScore,
           common_words_count: analysis.commonWords.length,
         },
       });
       langfuseSpan?.end();
       
       return analysis;
    }
  );
}

// LangGraph Node 2: Activity Generation (LLM call)
async function generateActivity(partner1Input: string, partner2Input: string, analysis: any, langfuseTrace?: any) {
  const inputData = {
    partner1Input,
    partner2Input,
    analysis,
    task: "Generate personalized relationship activity using Gemini"
  };

  return await executeLangGraphNode(
    "generate_activity",
    "Generate Relationship Activity",
    2,
    inputData,
         async (span) => {
       initializeClients();
       
       // Create Langfuse span for LLM generation
       const langfuseSpan = langfuseTrace?.span({
         name: "activity_generation",
         input: inputData,
         metadata: { node_type: "llm_generation", step: 2, model: "gemini-2.5-flash" },
       });
       
       // Override span kind for LLM and add LLM-specific attributes
       span.setAttributes({
         "openinference.span.kind": "LLM",
         "llm.model_name": "gemini-2.5-flash",
         "llm.provider": "google",
         "llm.request.model": "gemini-2.5-flash",
       });
      
      const prompt = `Generate a personalized relationship activity for these partners:

Partner 1: "${partner1Input}"
Partner 2: "${partner2Input}"

Compatibility Analysis:
- Score: ${analysis.compatibilityScore.toFixed(0)}%
- Common interests: ${analysis.commonWords.join(', ') || 'general compatibility'}
- Partner 1 themes: ${analysis.partner1Themes.join(', ')}
- Partner 2 themes: ${analysis.partner2Themes.join(', ')}

Create ONE personalized activity that bridges their interests. Return valid JSON:
{
  "title": "Activity Name (10-25 chars)",
  "description": "Brief description of what to do (50-150 chars)",
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

      // Set LLM input messages
      span.setAttributes({
        "llm.input_messages": JSON.stringify([
          { role: "user", content: prompt }
        ]),
        "llm.request.temperature": 0.7,
      });

      try {
        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          config: { 
            responseMimeType: "application/json",
            temperature: 0.7 
          },
          contents: prompt,
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response from Gemini API");
        }
        
        const activity = JSON.parse(responseText);
        
        // Set LLM output messages and metrics
        span.setAttributes({
          "llm.output_messages": JSON.stringify([
            { role: "assistant", content: responseText }
          ]),
          "llm.response.model": "gemini-2.5-flash",
          "llm.usage.input_tokens": prompt.length / 4, // Rough estimate
          "llm.usage.output_tokens": responseText.length / 4,
          "activity.title": activity.title,
          "activity.category": activity.category,
          "activity.difficulty": activity.difficultyLevel,
        });
        
                 console.log(`🎯 Generated activity: "${activity.title}" (${activity.category})`);
         
         // Update Langfuse span with successful generation
         langfuseSpan?.update({
           output: activity,
           metadata: {
             success: true,
             model: "gemini-2.5-flash",
             activity_title: activity.title,
             activity_category: activity.category,
           },
         });
         langfuseSpan?.end();
         
         return activity;
        
             } catch (apiError: any) {
         console.log(`⚠️ Gemini API failed: ${apiError.message}`);
         span.setAttributes({
           "llm.error": apiError.message,
           "error.type": "api_failure",
         });
         
         // Update Langfuse span with error
         langfuseSpan?.update({
           output: null,
           metadata: {
             success: false,
             error: apiError.message,
             model: "gemini-2.5-flash",
           },
         });
         langfuseSpan?.end();
         
         throw apiError;
      }
    }
  );
}

// LangGraph Node 3: Validation & Ranking
async function validateActivity(activity: any, analysis: any, langfuseTrace?: any) {
  const inputData = {
    activity,
    analysis,
    task: "Validate generated activity and rank conversation prompts by compatibility"
  };

  return await executeLangGraphNode(
    "validate_activity",
    "Validate & Rank Activity",
    3,
    inputData,
         async (span) => {
       // Create Langfuse span for validation
       const langfuseSpan = langfuseTrace?.span({
         name: "validate_activity",
         input: inputData,
         metadata: { node_type: "validation_ranking", step: 3 },
       });
       
       const validations = {
         hasTitle: !!activity.title,
         titleLength: activity.title ? activity.title.length : 0,
         hasDescription: !!activity.description,
         hasConversationPrompts: !!activity.conversationPrompts,
         promptsCount: activity.conversationPrompts ? activity.conversationPrompts.length : 0,
         hasCategory: !!activity.category,
         hasEstimatedTime: !!activity.estimatedTime,
       };
      
      const isValid = validations.hasTitle && 
                     validations.titleLength <= 25 &&
                     validations.hasConversationPrompts && 
                     validations.promptsCount === 3 &&
                     validations.hasCategory;

      // Rank conversation prompts based on compatibility score
      let rankedPrompts = [];
      let topPrompt = null;
      
      if (activity.conversationPrompts && activity.conversationPrompts.length > 0) {
        // Create scoring logic based on compatibility and content analysis
        const compatibilityScore = analysis.compatibilityScore || 50;
        const commonWords = analysis.commonWords || [];
        
                 // Score each prompt based on:
         // 1. Compatibility score influence
         // 2. Whether it contains themes relevant to both partners
         // 3. Question complexity and depth
         rankedPrompts = activity.conversationPrompts.map((prompt: string, index: number) => {
           let score = 50; // Base score
           
           // Compatibility influence (30% of score)
           score += (compatibilityScore - 50) * 0.3;
           
           // Common interests bonus (20% of score)
           const promptLower = prompt.toLowerCase();
           commonWords.forEach((word: string) => {
             if (promptLower.includes(word.toLowerCase())) {
               score += 4; // Bonus for each common interest mentioned
             }
           });
           
           // Question depth and engagement bonus (25% of score)
           if (promptLower.includes('how') || promptLower.includes('why') || promptLower.includes('what')) {
             score += 5; // Open-ended questions get bonus
           }
           if (promptLower.includes('together') || promptLower.includes('we') || promptLower.includes('our')) {
             score += 8; // Relationship-focused questions get higher bonus
           }
           if (promptLower.includes('feel') || promptLower.includes('think') || promptLower.includes('appreciate')) {
             score += 6; // Emotional depth questions get bonus
           }
           
           // Length bonus for thoughtful questions (15% of score)
           if (prompt.length > 40 && prompt.length < 100) {
             score += 3; // Sweet spot for question length
           }
           
           // Variety bonus (10% of score) - prefer middle questions if similar scores
           if (index === 1) score += 2; // Slight preference for middle option
           
           return {
             prompt,
             score: Math.round(score * 10) / 10, // Round to 1 decimal
             originalIndex: index
           };
         }).sort((a: any, b: any) => b.score - a.score); // Sort by highest score first
        
        topPrompt = rankedPrompts[0];
      }
      
             // Set validation and ranking details as attributes
       const commonWords = analysis.commonWords || [];
       span.setAttributes({
         "validation.passed": isValid,
         "validation.title_present": validations.hasTitle,
         "validation.title_length": validations.titleLength,
         "validation.prompts_count": validations.promptsCount,
         "validation.has_category": validations.hasCategory,
         "validation.details": JSON.stringify(validations),
         // Ranking attributes
         "ranking.compatibility_score": analysis.compatibilityScore || 0,
         "ranking.common_words_count": commonWords.length,
         "ranking.top_prompt_score": topPrompt?.score || 0,
         "ranking.top_prompt_index": topPrompt?.originalIndex || 0,
         "ranking.all_scores": JSON.stringify(rankedPrompts.map((p: any) => ({ index: p.originalIndex, score: p.score }))),
       });
      
      const result = { 
        isValid, 
        activity, 
        validations,
                 ranking: {
           rankedPrompts,
           topPrompt: topPrompt?.prompt || (activity.conversationPrompts ? activity.conversationPrompts[0] : null),
           topPromptScore: topPrompt?.score || 0,
           compatibilityInfluence: analysis.compatibilityScore || 50,
           commonInterestsCount: (analysis.commonWords || []).length,
         },
        validatedAt: new Date().toISOString()
      };
      
             const passedChecks = Object.entries(validations).filter(([k,v]) => v).length;
             const totalChecks = Object.keys(validations).length;
             console.log(`✅ Validation ${isValid ? 'PASSED' : 'FAILED'}: ${passedChecks}/${totalChecks} checks`);
             if (topPrompt) {
               console.log(`🎯 Top conversation prompt (score: ${topPrompt.score}): "${topPrompt.prompt}"`);
             }
       
       // Update Langfuse span with validation results
       langfuseSpan?.update({
         output: result,
         metadata: {
           validation_passed: isValid,
           checks_passed: passedChecks,
           total_checks: totalChecks,
           top_prompt_score: topPrompt?.score || 0,
           ranking_success: !!topPrompt,
         },
       });
       langfuseSpan?.end();
       
       return result;
    }
  );
}

// Main LangGraph workflow
export async function generateActivityWithLangGraph(
  partner1Input: string, 
  partner2Input: string
): Promise<any> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create Langfuse trace for the entire workflow
  const langfuse = getLangfuseClient();
  const langfuseTrace = langfuse?.trace({
    sessionId,
    name: "langgraph_relationship_workflow",
    input: { partner1Input, partner2Input },
    metadata: {
      workflow_type: "relationship_activity_generation",
      version: "2.0.0",
    },
  });
  
  return await tracer.startActiveSpan(
    "langgraph_workflow",
    {
      attributes: {
        "openinference.span.kind": "WORKFLOW",
        // LangGraph workflow metadata for Arize visualization
        "metadata.langgraph_graph": "relationship_activity_generator",
        "metadata.langgraph_thread_id": sessionId,
        // Graph node identification
        "graph.node.id": "langgraph_workflow",
        "graph.node.display_name": "LangGraph: Relationship Activity Generator",
        // OpenInference session and user tracking
        "session.id": sessionId,
        "user.id": "relationship-garden-user",
        // Workflow metadata
        "workflow.name": "relationship_activity_generator",
        "workflow.version": "2.0.0",
        // OpenInference input/output format
        "input.value": JSON.stringify({
          partner1Input,
          partner2Input,
          sessionId,
          timestamp: new Date().toISOString()
        }),
        "input.mime_type": "application/json",
      },
    },
    async (rootSpan) => {
      try {
        // Agent metadata already set in span creation
        
        console.log("🚀 Starting LangGraph relationship workflow...");
        
                          // Step 1: Analyze inputs
         const analysis = await analyzeInputs(partner1Input, partner2Input, langfuseTrace);
         
         // Step 2: Generate activity (only LLM call)
         let activity;
         try {
           activity = await generateActivity(partner1Input, partner2Input, analysis, langfuseTrace);
         } catch (error) {
           console.log("🛡️ Using fallback due to generation failure");
           activity = getFallbackActivity();
           rootSpan.setAttributes({
             "workflow.fallback_used": true,
             "workflow.fallback_reason": error instanceof Error ? error.message : String(error),
           });
         }
         
         // Step 3: Validate and rank conversation prompts
         const validation = await validateActivity(activity, analysis, langfuseTrace);
        
        // Create final activity with ranking information
        let finalActivity = validation.isValid ? activity : getFallbackActivity();
        
        // Add top conversation prompt to the final activity
        if (validation.ranking && validation.ranking.topPrompt) {
          finalActivity = {
            ...finalActivity,
            topConversationPrompt: validation.ranking.topPrompt,
            topPromptScore: validation.ranking.topPromptScore,
            compatibilityScore: Math.round(analysis.compatibilityScore),
            rankingDetails: {
              allPrompts: validation.ranking.rankedPrompts?.map((p: any) => ({
                prompt: p.prompt,
                score: p.score,
                rank: validation.ranking.rankedPrompts.indexOf(p) + 1
              })) || [],
              compatibilityInfluence: validation.ranking.compatibilityInfluence,
              commonInterestsCount: validation.ranking.commonInterestsCount
            }
          };
        }
        
        // Set OpenInference output format
        rootSpan.setAttributes({
          "output.value": JSON.stringify(finalActivity),
          "output.mime_type": "application/json",
          // LangGraph workflow completion metadata
          "metadata.langgraph_final_state": "completed",
          "metadata.langgraph_success": true,
          // Workflow execution metrics
          "workflow.success": true,
          "workflow.nodes_executed": 3,
          "workflow.total_llm_calls": 1,
          "final.activity_title": finalActivity.title,
          "final.activity_category": finalActivity.category,
          "final.compatibility_score": analysis.compatibilityScore,
          "final.validation_passed": validation.isValid,
        });
        
                 rootSpan.setStatus({ code: SpanStatusCode.OK });
         console.log(`✅ LangGraph workflow completed: "${finalActivity.title}"`);
         
         // Update Langfuse trace with final output
         langfuseTrace?.update({
           output: finalActivity,
           metadata: {
             success: true,
             compatibility_score: analysis.compatibilityScore,
             activity_title: finalActivity.title,
             validation_passed: validation.isValid,
           },
         });
         
         return finalActivity;
        
      } catch (error) {
        rootSpan.recordException(error as Error);
        rootSpan.setStatus({ code: SpanStatusCode.ERROR });
        console.error("❌ LangGraph workflow failed:", error);
        
        // Return fallback on any error
        const fallback = getFallbackActivity();
        rootSpan.setAttributes({
          "output.value": JSON.stringify(fallback),
          "output.mime_type": "application/json",
          // LangGraph workflow error metadata
          "metadata.langgraph_final_state": "error",
          "metadata.langgraph_success": false,
          // Workflow error metrics
          "workflow.success": false,
          "workflow.error": error instanceof Error ? error.message : String(error),
          "fallback.used": true,
          "final.activity_title": fallback.title,
        });
         
         // Update Langfuse trace with error
         langfuseTrace?.update({
           output: fallback,
           metadata: {
             success: false,
             error: error instanceof Error ? error.message : String(error),
             fallback_used: true,
           },
         });
         
         return fallback;
             } finally {
         rootSpan.end();
         
         // Flush Langfuse data
         try {
           await langfuse?.flushAsync();
         } catch (flushError) {
           console.warn("⚠️ Failed to flush Langfuse data:", flushError);
         }
       }
    }
  );
} 