import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter as GrpcOTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SEMRESATTRS_PROJECT_NAME } from '@arizeai/openinference-semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Metadata } from '@grpc/grpc-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// DEBUGGING ENVIRONMENT VARIABLE LOADING
// =============================================================================

console.log('🔍 === DEBUGGING ENVIRONMENT VARIABLES ===');
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Node.js version:', process.version);
console.log('🔍 Platform:', process.platform);

// Check .env file existence
const envPath = path.resolve(process.cwd(), '.env');
console.log('🔍 Looking for .env file at:', envPath);
console.log('🔍 .env file exists:', fs.existsSync(envPath));

// Check environment variables BEFORE dotenv.config()
console.log('\n📊 Environment variables BEFORE dotenv.config():');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `"${process.env.OPENAI_API_KEY.substring(0, 15)}..." (${process.env.OPENAI_API_KEY.length} chars)` : 
  'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 
  `"${process.env.GEMINI_API_KEY.substring(0, 15)}..." (${process.env.GEMINI_API_KEY.length} chars)` : 
  'Not set');
console.log('ARIZE_API_KEY:', process.env.ARIZE_API_KEY ? 
  `"${process.env.ARIZE_API_KEY.substring(0, 15)}..." (${process.env.ARIZE_API_KEY.length} chars)` : 
  'Not set');

// Show .env file contents if it exists
if (fs.existsSync(envPath)) {
  console.log('\n📄 .env file content:');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach((line, i) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && key.includes('API_KEY')) {
          console.log(`${i + 1}: ${key}=${value ? `"${value.substring(0, 15)}..." (${value.length} chars)` : 'empty'}`);
        } else {
          console.log(`${i + 1}: ${line}`);
        }
      } else if (line.trim()) {
        console.log(`${i + 1}: ${line}`);
      }
    });
  } catch (error) {
    console.error('❌ Error reading .env file:', error);
  }
} else {
  console.log('⚠️  .env file does not exist at expected location');
}

// Load environment variables. In production we do NOT override existing env vars supplied by Render.
const shouldOverride = process.env.NODE_ENV !== 'production';
console.log(`\n🔧 Loading dotenv with override: ${shouldOverride}`);
const dotenvResult = dotenv.config({ override: shouldOverride });
console.log('🔧 dotenv.config() result:', dotenvResult);

// Check environment variables AFTER dotenv.config()
console.log('\n📊 Environment variables AFTER dotenv.config():');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `"${process.env.OPENAI_API_KEY.substring(0, 15)}..." (${process.env.OPENAI_API_KEY.length} chars)` : 
  'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 
  `"${process.env.GEMINI_API_KEY.substring(0, 15)}..." (${process.env.GEMINI_API_KEY.length} chars)` : 
  'Not set');
console.log('ARIZE_API_KEY:', process.env.ARIZE_API_KEY ? 
  `"${process.env.ARIZE_API_KEY.substring(0, 15)}..." (${process.env.ARIZE_API_KEY.length} chars)` : 
  'Not set');

// Check if keys are still placeholders
const isPlaceholder = (key: string, value: string | undefined): boolean => {
  if (!value) return false;
  return value.includes('your-') || value.includes('api-key-here') || value.includes('your_');
};

console.log('\n🚨 Placeholder check:');
console.log('OPENAI_API_KEY is placeholder:', isPlaceholder('OPENAI_API_KEY', process.env.OPENAI_API_KEY));
console.log('GEMINI_API_KEY is placeholder:', isPlaceholder('GEMINI_API_KEY', process.env.GEMINI_API_KEY));

// If still placeholders, try to manually set them from a backup .env file
if (isPlaceholder('OPENAI_API_KEY', process.env.OPENAI_API_KEY) || 
    isPlaceholder('GEMINI_API_KEY', process.env.GEMINI_API_KEY)) {
  console.log('\n🔄 Detected placeholder values, attempting manual override...');
  
  // Force override with proper values if .env file exists
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        if (line.trim() && !line.startsWith('#') && line.includes('=')) {
          const [key, value] = line.split('=');
          if (key && value) {
            const cleanKey = key.trim();
            const cleanValue = value.trim();
            
            if ((cleanKey === 'OPENAI_API_KEY' || cleanKey === 'GEMINI_API_KEY') && 
                !isPlaceholder(cleanKey, cleanValue)) {
              console.log(`🔄 Manually setting ${cleanKey} from .env file`);
              process.env[cleanKey] = cleanValue;
            }
          }
        }
      });
    } catch (error) {
      console.error('❌ Error manually parsing .env file:', error);
    }
  }
}

console.log('\n📊 Final environment variables:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `"${process.env.OPENAI_API_KEY.substring(0, 15)}..." (${process.env.OPENAI_API_KEY.length} chars)` : 
  'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 
  `"${process.env.GEMINI_API_KEY.substring(0, 15)}..." (${process.env.GEMINI_API_KEY.length} chars)` : 
  'Not set');

console.log('🔍 === END DEBUGGING ===\n');

// =============================================================================
// ARIZE TRACING CONFIGURATION
// =============================================================================

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

console.log('🚀 Initializing Arize tracing...');
console.log('ARIZE_API_KEY:', process.env.ARIZE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('ARIZE_SPACE_ID:', process.env.ARIZE_SPACE_ID ? '✅ Set' : '❌ Missing');
console.log('ARIZE_PROJECT_NAME:', process.env.ARIZE_PROJECT_NAME || 'relationship-garden');

// Only initialize tracing if we have the required environment variables
if (process.env.ARIZE_API_KEY && process.env.ARIZE_SPACE_ID) {
  // Create gRPC metadata for Arize authentication
  const metadata = new Metadata();
  metadata.set('space_id', process.env.ARIZE_SPACE_ID);
  metadata.set('api_key', process.env.ARIZE_API_KEY);

  // Create the gRPC OTLP exporter with correct Arize configuration
  const arizeExporter = new GrpcOTLPTraceExporter({
    url: 'https://otlp.arize.com/v1',
    metadata,
  });

  // Enhanced resource attributes for Arize/OpenInference
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'relationship-garden-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: `${process.env.NODE_ENV}-${Date.now()}`,
    [SEMRESATTRS_PROJECT_NAME]: process.env.ARIZE_PROJECT_NAME || 'relationship-garden',
    'model.name': 'relationship-garden-activity-generator',
    'model.version': '1.0.0',
    'environment': process.env.NODE_ENV || 'development',
  });

  const sdk = new NodeSDK({
    traceExporter: arizeExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Configure specific instrumentations
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (span, request) => {
            // Only trace API endpoints, not static files
            const req = request as any;
            const url = req.url || req.path || '';
            if (url.includes('/api/')) {
              span.setAttributes({
                'http.request.traced': true,
                'http.request.important': true,
              });
            } else {
              // Mark static file requests
              span.setAttributes({
                'http.request.traced': false,
                'http.request.static': true,
              });
            }
          },
          responseHook: (span, response) => {
            // Only keep detailed data for API responses  
            const spanAttribs = (span as any).attributes || {};
            const url = spanAttribs['http.url'] || spanAttribs['http.target'] || '';
            if (!url.includes('/api/')) {
              // Minimize attributes for non-API requests
              span.setAttributes({
                'http.response.minimal': true,
              });
            }
          },
        },
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Disable file system instrumentation to reduce noise
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false, // Disable DNS instrumentation to reduce noise
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false, // Disable network instrumentation to reduce noise
        },
      }),
    ],
    resource,
  });

  try {
    sdk.start();
    console.log('✅ OpenTelemetry tracing initialized successfully');
    console.log('📡 Traces will be sent to Arize at: https://otlp.arize.com/v1');
    console.log('🔗 Project:', process.env.ARIZE_PROJECT_NAME || 'relationship-garden');
  } catch (error: any) {
    console.error('❌ Error initializing OpenTelemetry tracing:', error);
    // Don't exit the process, just continue without tracing
  }

  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down tracing...');
    sdk.shutdown()
      .then(() => console.log('✅ Tracing terminated successfully'))
      .catch((error) => console.log('❌ Error terminating tracing:', error))
      .finally(() => process.exit(0));
  });
} else {
  console.log('⚠️  Arize tracing disabled - missing required environment variables');
  console.log('   Set ARIZE_API_KEY and ARIZE_SPACE_ID to enable tracing');
} 