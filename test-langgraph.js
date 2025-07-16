#!/usr/bin/env node

// Simple test script for LangGraph integration
const fetch = require('node-fetch');

async function testLangGraphEndpoint() {
  console.log('🧪 Testing LangGraph integration...\n');
  
  const testData = {
    partner1Input: "I love hiking and outdoor adventures, exploring nature trails and camping under the stars.",
    partner2Input: "I enjoy reading books and cozy indoor activities, like cooking together and having deep conversations."
  };

  console.log('📝 Test inputs:');
  console.log(`Partner 1: ${testData.partner1Input}`);
  console.log(`Partner 2: ${testData.partner2Input}\n`);

  try {
    console.log('🚀 Sending request to /api/activities/generate-advanced...');
    
    const response = await fetch('http://localhost:5000/api/activities/generate-advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! LangGraph workflow completed:\n');
      console.log('📋 Generated Activity:');
      console.log(`Title: ${result.activity.title}`);
      console.log(`Category: ${result.activity.category}`);
      console.log(`Activity Type: ${result.activity.activityType}`);
      console.log(`Difficulty: ${result.activity.difficultyLevel}`);
      console.log(`Estimated Time: ${result.activity.estimatedTime}`);
      console.log(`Description: ${result.activity.description}`);
      console.log('\n💬 Conversation Prompts:');
      result.activity.conversationPrompts.forEach((prompt, i) => {
        console.log(`${i + 1}. ${prompt}`);
      });
      
      if (result.activity.materials) {
        console.log(`\n🛠️ Materials: ${result.activity.materials.join(', ')}`);
      }
      
      console.log('\n🔍 Metadata:');
      console.log(`Workflow: ${result.metadata.workflow}`);
      console.log(`Version: ${result.metadata.version}`);
      console.log(`ID: ${result.activity.id}`);
      
    } else {
      console.log('❌ Request failed:');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${result.error}`);
      if (result.details) {
        console.log(`Details: ${result.details}`);
      }
    }
    
  } catch (error) {
    console.log('💥 Test failed with error:');
    console.error(error.message);
    console.log('\n💡 Make sure your server is running: npm run dev');
  }
}

// Also test the standard endpoint to compare
async function testStandardEndpoint() {
  console.log('\n\n🔄 Testing standard endpoint for comparison...\n');
  
  const testData = {
    partner1Input: "I love hiking and outdoor adventures, exploring nature trails and camping under the stars.",
    partner2Input: "I enjoy reading books and cozy indoor activities, like cooking together and having deep conversations."
  };

  try {
    const response = await fetch('http://localhost:5000/api/activities/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Standard endpoint also works:');
      console.log(`Title: ${result.activity.title}`);
      console.log(`Category: ${result.activity.category}`);
      console.log('(This should now use LangGraph as primary with fallbacks)');
    } else {
      console.log('❌ Standard endpoint failed:', result.error);
    }
    
  } catch (error) {
    console.log('💥 Standard endpoint test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testLangGraphEndpoint();
  await testStandardEndpoint();
  
  console.log('\n\n🎯 Next Steps:');
  console.log('1. Check your Arize dashboard for detailed traces');
  console.log('2. Look for workflow traces with steps: analyze → assess → generate → personalize → validate');
  console.log('3. Compare the quality of LangGraph vs simple AI generation');
  console.log('4. Monitor compatibility scores and activity types in Arize');
}

runTests(); 