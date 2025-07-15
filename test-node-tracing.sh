#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Node.js Arize Tracing${NC}"
echo "=================================="

# Check if jq is available for JSON formatting
if command -v jq >/dev/null 2>&1; then
    JQ_AVAILABLE=true
else
    JQ_AVAILABLE=false
    echo -e "${YELLOW}⚠️  jq not found - JSON output will not be formatted${NC}"
fi

# Start the server in background
echo -e "${YELLOW}🚀 Starting development server...${NC}"
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
sleep 8

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}❌ Server failed to start. Check server.log for details.${NC}"
    cat server.log
    exit 1
fi

# Test the activity generation endpoint
echo -e "${BLUE}📤 Testing activity generation with tracing...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/activities/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "partner1Input": "I love hiking and outdoor adventures",
    "partner2Input": "I enjoy cooking and trying new recipes"
  }')

if [ $JQ_AVAILABLE = true ]; then
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "$RESPONSE"
fi

echo ""
echo -e "${GREEN}✅ Test completed! Check your Arize dashboard for traces.${NC}"

# Stop the server
echo -e "${YELLOW} Stopping server...${NC}"
kill $SERVER_PID 2>/dev/null || true
pkill -f 'tsx server/index.ts' 2>/dev/null || true

# Clean up log file
rm -f server.log

echo -e "${GREEN}✅ Server stopped${NC}"
