# Dual Observability Setup: Arize + Langfuse

## Overview
This project uses **dual observability** with both Arize (OpenTelemetry) and Langfuse running together on the same LangGraph workflow code. Each system provides complementary insights without interfering with each other.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-c1334622-bf22-42db-a461-c8cbede7f414
LANGFUSE_SECRET_KEY=sk-lf-b58ec0a6-4f8d-427b-aff6-f17e0d6fc533
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

## What's Integrated

### 1. Parallel Observability Systems
- **OpenTelemetry → Arize**: LangGraph node structure, **agent graph visualization**, performance metrics, infrastructure monitoring
- **Langfuse**: Session-based conversation tracking, LLM call details, user journey analysis
- **Same Code**: Both systems instrument the identical workflow without conflicts

### 2. LangGraph Workflow Instrumentation
The `generateActivityWithLangGraph` function creates traces in both systems:
- **Session ID**: Unique identifier shared between both platforms
- **Three LangGraph Nodes**: analyze_inputs → generate_activity → validate_activity
- **Parallel Spans**: Each node creates spans in both OpenTelemetry and Langfuse
- **Rich Metadata**: Compatibility scores, validation results, LLM performance data

### 3. Agent Graph Visualization (Arize)
Proper agent metadata is configured for Arize's agent graph view:
- **Workflow Root**: `langgraph_workflow` as the main orchestrator
- **Node Hierarchy**: `langgraph_workflow` → `analyze_inputs` → `generate_activity` → `validate_activity`
- **Agent Metadata**: Each node includes `graph.node.id`, `graph.node.parent_id`, and `agent.*` attributes
- **Visual Flow**: Sequential workflow visualization showing the complete LangGraph execution path

### 4. LLM Call Tracking
The `generateActivity` function (Gemini LLM calls) includes:
- Input/output logging
- Token usage tracking
- Error handling with fallback tracking
- Model performance metrics

## Features

### Session-Based Workflow Grouping
Each workflow execution is assigned a unique session ID that groups all related traces and spans:
```typescript
// Generate unique session ID
const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create main trace with session ID
const langfuseTrace = createLangfuseTrace(
  "relationship_activity_workflow",
  { partner1Input, partner2Input },
  { version: "2.0.0", workflow_type: "relationship_activity_generation" },
  sessionId // All traces in this workflow share this session ID
);

// Create spans within the trace for each step
const analysisSpan = createLangfuseSpan(langfuseTrace, "analyze_inputs", ...);
const generationSpan = createLangfuseSpan(langfuseTrace, "activity_generation", ...);
const validationSpan = createLangfuseSpan(langfuseTrace, "validate_activity", ...);
```

### LLM Call Monitoring
- Tracks all Gemini API calls
- Records prompts, responses, and metadata
- Monitors generation success/failure rates
- Captures compatibility scores and activity quality

### Error Handling
- Automatic fallback tracking when LLM calls fail
- Error metadata captured in both OpenTelemetry and Langfuse
- Graceful degradation monitoring

## Viewing Traces

1. **Langfuse Dashboard**: Visit https://cloud.langfuse.com
   - **Sessions View**: See each workflow execution grouped by session ID
   - **Traces View**: Individual traces with their spans (analysis → generation → validation)
   - **LLM Calls**: Detailed view of Gemini API interactions with prompts and responses
2. **Arize Dashboard**: Your existing Arize setup for infrastructure metrics
   - **🎯 Agent Graph View**: Visual workflow diagram showing LangGraph node relationships
   - **Traces View**: OpenTelemetry spans with detailed performance metrics
   - **LLM Analytics**: Token usage, latency, and error tracking

### What You'll See in Langfuse
- **Session Grouping**: Each relationship activity generation appears as a session
- **Workflow Trace**: Main trace showing the complete workflow execution
- **Component Spans**: Individual spans for:
  - `analyze_inputs`: Partner input analysis with compatibility scoring
  - `activity_generation`: Gemini LLM call with prompt/response details
  - `validate_activity`: Activity validation and quality checks
- **Rich Metadata**: Compatibility scores, activity titles, success/failure status
- **Error Tracking**: Failed LLM calls and fallback usage

## Key Benefits

1. **LLM Observability**: Track conversation quality, prompt effectiveness
2. **Dual Monitoring**: Infrastructure (Arize) + LLM (Langfuse) metrics
3. **Debugging**: Trace failed generations and fallback usage
4. **Performance**: Monitor response times and quality scores
5. **Cost Tracking**: Understand token usage patterns

## Testing

### Option 1: Via Web Application
Run your development server and generate an activity:
```bash
npm run dev
```

Visit your application and create a relationship activity.

### Option 2: Direct API Testing
Use the included test script:
```bash
node test-langfuse-sessions.js
```

This will:
- Execute multiple workflow runs
- Generate different session IDs for each run
- Test the complete tracing pipeline
- Show console output for verification

### Verification
Check both dashboards after testing:
- **Langfuse dashboard**: Session grouping and workflow tracing
- **Arize dashboard**: Infrastructure metrics and performance data

You should see each workflow execution as a separate session in Langfuse, with all spans properly grouped under their respective session IDs.

## Integration Details

- **Flush Strategy**: Langfuse data is automatically flushed at the end of each workflow
- **Error Handling**: Failed Langfuse operations don't break the main workflow
- **Metadata**: Rich context including compatibility scores, activity types, and user inputs
- **Trace Linking**: OpenTelemetry spans include Langfuse trace IDs for correlation

## Recent Fixes & Optimizations

### HTTP Trace Filtering (Arize)
- **Problem**: Unwanted HTTP GET/POST traces cluttering Arize dashboard
- **Solution**: Added `ignoreIncomingRequestHook` to filter out non-API requests
- **Result**: Only relevant API calls (POST to `/api/activities/`) are traced

### LangGraph Span Hierarchy
- **Problem**: Agent spans appearing as separate traces instead of nested structure
- **Solution**: Simplified span creation to rely on OpenTelemetry's automatic parent-child relationships  
- **Result**: Proper workflow hierarchy: `langgraph_workflow` → `analyze_inputs` → `generate_activity` → `validate_activity`

### Agent Graph Metadata
- **Enhanced**: Each node includes proper `graph.node.*` and `agent.*` attributes for Arize agent graph visualization
- **Optimized**: Removed unnecessary parentId parameters while maintaining graph structure

### Database Schema Fix
- **Problem**: PostgreSQL schema (`pgTable`) used with SQLite database causing table creation failures
- **Solution**: Updated schema to use `sqliteTable` with proper SQLite column types and JSON serialization for arrays
- **Result**: Database operations now work correctly, AI-generated activities save and display properly instead of fallback 