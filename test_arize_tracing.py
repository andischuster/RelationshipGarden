import os
from google import genai
from arize.otel import register
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
from dotenv import load_dotenv
load_dotenv()

# Initialize Arize OpenTelemetry using direct register import
tracer_provider = register(
    space_id = os.environ.get("ARIZE_SPACE_ID", "U3BhY2U6MjM1MzY6d2g5Tg=="),
    api_key = os.environ.get("ARIZE_API_KEY", "ak-a35da5a8-45e4-44fc-97b2-9a271a334f97-sPAppaT-ftCFvHTrexHTOYsDUm_vuZK1"),
    project_name = os.environ.get("ARIZE_PROJECT_NAME", "relay retro"),
    verbose=True,
    log_to_console=True
)

def send_message_multi_turn() -> tuple[str, str]:
    # Get the current tracer
    tracer = trace.get_tracer(__name__)
    
    with tracer.start_as_current_span("multi_turn_conversation") as span:
        try:
            # Set span attributes for better observability
            span.set_attribute("ai.model", "gemini-2.0-flash-001")
            span.set_attribute("ai.conversation.turns", 2)
            
            client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
            chat = client.chats.create(model="gemini-2.0-flash-001")
            
            # First message
            with tracer.start_as_current_span("first_message") as msg1_span:
                msg1_span.set_attribute("ai.input", "What is the capital of France?")
                response1 = chat.send_message("What is the capital of France?")
                msg1_span.set_attribute("ai.output", response1.text or "")
                msg1_span.set_attribute("ai.response_length", len(response1.text or ""))
            
            # Second message
            with tracer.start_as_current_span("second_message") as msg2_span:
                msg2_span.set_attribute("ai.input", "Why is the sky blue?")
                response2 = chat.send_message("Why is the sky blue?")
                msg2_span.set_attribute("ai.output", response2.text or "")
                msg2_span.set_attribute("ai.response_length", len(response2.text or ""))
            
            # Set span status to success
            span.set_status(Status(StatusCode.OK))
            
            return response1.text or "", response2.text or ""
            
        except Exception as e:
            # Set span status to error
            span.set_status(Status(StatusCode.ERROR, str(e)))
            span.record_exception(e)
            raise

if __name__ == "__main__":
    # Check for required environment variables
    if not os.environ.get("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY environment variable is required")
        exit(1)
    
    if not os.environ.get("ARIZE_API_KEY"):
        print("Warning: ARIZE_API_KEY not set, tracing will be limited")
    
    try:
        print("Starting multi-turn conversation with Arize tracing...")
        response1, response2 = send_message_multi_turn()
        
        print("\n=== Conversation Results ===")
        print(f"Q1: What is the capital of France?")
        print(f"A1: {response1[:100]}...")
        print(f"\nQ2: Why is the sky blue?")
        print(f"A2: {response2[:100]}...")
        
        print("\n✅ Conversation completed successfully!")
        print("Check your Arize dashboard for traces and spans.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1) 