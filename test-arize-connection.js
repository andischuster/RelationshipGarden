#!/usr/bin/env node

// Simple test to verify Arize connection
import { trace } from '@opentelemetry/api';
import './server/tracing.ts';

async function testArizeConnection() {
  console.log('🔍 Testing Arize connection...');
  console.log('Environment check:');
  console.log('- ARIZE_API_KEY:', process.env.ARIZE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- ARIZE_SPACE_ID:', process.env.ARIZE_SPACE_ID ? '✅ Set' : '❌ Missing'); 
  console.log('- ARIZE_PROJECT_NAME:', process.env.ARIZE_PROJECT_NAME || 'relationship-garden');

  const tracer = trace.getTracer('test-arize-connection', '1.0.0');
  
  // Create a simple test trace
  await tracer.startActiveSpan('test-trace', {
    attributes: {
      'test.name': 'arize-connection-test',
      'test.timestamp': new Date().toISOString(),
      'graph.node.id': 'test-node',
      'graph.node.display_name': 'Test Node'
    }
  }, async (span) => {
    console.log('📤 Sending test trace to Arize...');
    
    span.setAttribute('test.status', 'success');
    span.setStatus({ code: 1 }); // OK
    
    // Wait a bit to ensure trace is sent
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    span.end();
    console.log('✅ Test trace sent! Check your Arize dashboard.');
  });
}

testArizeConnection().catch(console.error); 