const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { trace } = require('@opentelemetry/api');
require('dotenv').config();

console.log('ARIZE_API_KEY:', process.env.ARIZE_API_KEY);
console.log('ARIZE_SPACE_ID:', process.env.ARIZE_SPACE_ID);
console.log('ARIZE_PROJECT_NAME:', process.env.ARIZE_PROJECT_NAME);

const exporter = new OTLPTraceExporter({
  url: 'https://otlp.arize.com/v1/traces',
  headers: {
    'Authorization': `Bearer ${process.env.ARIZE_API_KEY}`,
    'X-Arize-Space-Id': process.env.ARIZE_SPACE_ID || '',
    'X-Arize-Project-Name': process.env.ARIZE_PROJECT_NAME || '',
  },
});

const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: 'otel-arize-test',
  'openinference.project.name': process.env.ARIZE_PROJECT_NAME || '',
});

const provider = new NodeTracerProvider({
  resource,
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const tracer = trace.getTracer('otel-arize-test');

async function main() {
  const span = tracer.startSpan('arize-test-span');
  span.setAttribute('test', 'arize-nodejs');
  span.end();

  // Give the exporter time to send
  setTimeout(() => {
    console.log('Span sent, check Arize dashboard.');
    process.exit(0);
  }, 5000);
}

main(); 