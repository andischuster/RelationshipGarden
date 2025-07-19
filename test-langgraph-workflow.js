// Test the LangGraph workflow via API endpoint
async function generateActivityViaAPI(partner1Input, partner2Input) {
  const response = await fetch('http://localhost:5000/api/activities/generate-advanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      partner1Input,
      partner2Input
    })
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function testLangGraphWorkflow() {
  console.log("🧪 Testing LangGraph workflow with dual observability (Arize + Langfuse)...\n");
  console.log("🔧 Recent fixes:");
  console.log("   - Filtered out unwanted HTTP GET/POST traces from Arize");
  console.log("   - Fixed LangGraph span hierarchy for proper nesting");
  console.log("   - Implemented OpenInference semantic conventions for Arize agent graph\n");
  
  // Test 1: Single workflow execution
  console.log("📝 Test 1: Single workflow execution");
  const partner1Input = "I love cooking and trying new recipes";
  const partner2Input = "I enjoy gardening and outdoor activities";
  
  try {
    const result = await generateActivityViaAPI(partner1Input, partner2Input);
    console.log("✅ Workflow completed successfully");
    console.log("🎯 Generated activity:", result.activity.title);
    console.log("📊 Check both dashboards:");
    console.log("   🔹 Arize: OpenTelemetry traces with LangGraph structure");
    console.log("   🔹 Langfuse: Session-grouped spans with LLM details\n");
  } catch (error) {
    console.error("❌ Test 1 failed:", error.message);
  }
  
  // Test 2: Multiple workflow executions (different LangGraph traces)
  console.log("📝 Test 2: Multiple executions (different traces)");
  
  const workflows = [
    {
      partner1: "I love reading books and writing",
      partner2: "I enjoy playing music and concerts"
    },
    {
      partner1: "I'm into fitness and running",
      partner2: "I like painting and art galleries"
    }
  ];
  
  for (let i = 0; i < workflows.length; i++) {
    try {
      console.log(`🔄 Running workflow ${i + 1}...`);
      const result = await generateActivityViaAPI(
        workflows[i].partner1, 
        workflows[i].partner2
      );
      console.log(`✅ Workflow ${i + 1} completed: ${result.activity.title}`);
      console.log(`📊 Category: ${result.activity.category}, Difficulty: ${result.activity.difficultyLevel}`);
    } catch (error) {
      console.error(`❌ Workflow ${i + 1} failed:`, error.message);
    }
  }
  
  console.log("\n🎉 Test completed!");
  console.log("📊 Check both observability platforms:");
  console.log("\n🔹 Arize Dashboard:");
  console.log("   - 🎯 Agent Graph View: Visual workflow diagram with node relationships");
  console.log("   - LangGraph traces with proper node structure");
  console.log("   - OpenTelemetry spans: analyze_inputs → generate_activity → validate_activity");
  console.log("   - LLM instrumentation with token tracking");
  console.log("   - Rich metadata and performance metrics");
  console.log("\n🔹 Langfuse Dashboard:");
  console.log("   - Session-grouped workflows for conversation tracking");
  console.log("   - Individual spans for each LangGraph node");
  console.log("   - LLM call details with input/output logging");
  console.log("   - Compatibility scores and validation results");
}

// Run tests
testLangGraphWorkflow().catch(console.error); 