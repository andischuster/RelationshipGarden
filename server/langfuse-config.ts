import { Langfuse } from "langfuse";
import { CallbackHandler } from "langfuse-langchain";

// Initialize Langfuse client
let langfuseClient: Langfuse | null = null;
let langfuseHandler: CallbackHandler | null = null;

export function initializeLangfuse() {
  try {
    // Initialize Langfuse client with your provided keys
    langfuseClient = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY || "pk-lf-c1334622-bf22-42db-a461-c8cbede7f414",
      secretKey: process.env.LANGFUSE_SECRET_KEY || "sk-lf-b58ec0a6-4f8d-427b-aff6-f17e0d6fc533",
      baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
    });

    // Initialize callback handler for LangChain integration
    langfuseHandler = new CallbackHandler({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY || "pk-lf-c1334622-bf22-42db-a461-c8cbede7f414",
      secretKey: process.env.LANGFUSE_SECRET_KEY || "sk-lf-b58ec0a6-4f8d-427b-aff6-f17e0d6fc533",
      baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
    });

    console.log("✅ Langfuse initialized successfully");
    return { client: langfuseClient, handler: langfuseHandler };
  } catch (error) {
    console.error("❌ Failed to initialize Langfuse:", error);
    return { client: null, handler: null };
  }
}

export function getLangfuseClient(): Langfuse | null {
  if (!langfuseClient) {
    const result = initializeLangfuse();
    return result.client;
  }
  return langfuseClient;
}

export function getLangfuseHandler(): CallbackHandler | null {
  if (!langfuseHandler) {
    const result = initializeLangfuse();
    return result.handler;
  }
  return langfuseHandler;
}

// Create a trace for the relationship workflow
export function createLangfuseTrace(name: string, input: any, metadata?: any, sessionId?: string) {
  const client = getLangfuseClient();
  if (!client) return null;

  return client.trace({
    name,
    input,
    sessionId, // Group traces by session
    metadata: {
      ...metadata,
      project: "relationship-garden",
      environment: process.env.NODE_ENV || "development",
    },
  });
}

// Create a span within a trace
export function createLangfuseSpan(trace: any, name: string, input: any, metadata?: any) {
  if (!trace) return null;

  return trace.span({
    name,
    input,
    metadata,
  });
}

// Update span with output and end it
export function finalizeLangfuseSpan(span: any, output: any, metadata?: any) {
  if (!span) return;

  span.update({
    output,
    metadata,
  });
  span.end();
}

// Flush Langfuse data (important for serverless environments)
export async function flushLangfuse() {
  const client = getLangfuseClient();
  if (client) {
    await client.flushAsync();
  }
} 