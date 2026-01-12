#!/bin/bash

# Test the token launcher backend with a sample image

echo "🧪 Token Launcher - Integration Test"
echo "===================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend not running. Start with: npm run dev"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Create a simple test image (1x1 pixel PNG)
TEST_IMAGE="test-token.png"

# Create a minimal PNG using base64
# This is a 1x1 transparent PNG
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > "$TEST_IMAGE" 2>/dev/null || {
    # Fallback if base64 -d doesn't work
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' > "$TEST_IMAGE"
}

echo "📸 Test image created: $TEST_IMAGE"
echo ""

# Prepare JSON payloads
USER_PROMPT='{
  "idea": "AI trading bot meme with hacker vibes",
  "tone": "degen",
  "symbolHint": "BOT",
  "notes": "Next ELIZA but for trading"
}'

LAUNCH_CONFIG='{
  "devBuySol": 0.5,
  "slippage": 10,
  "priorityFee": 0.0005,
  "pool": "pump"
}'

echo "📤 Sending request to /api/agent/launch"
echo ""

# Send the request
RESPONSE=$(curl -s -X POST \
  -F "userPrompt=$USER_PROMPT" \
  -F "launchConfig=$LAUNCH_CONFIG" \
  -F "image=@$TEST_IMAGE" \
  http://localhost:3001/api/agent/launch)

echo "📥 Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Test complete!"
echo ""

# Cleanup
rm -f "$TEST_IMAGE"
