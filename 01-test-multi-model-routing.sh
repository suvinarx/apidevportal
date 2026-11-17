
#!/usr/bin/env bash

# Kong AI Gateway - Multi-Model Routing Test

BASE_URL="https://internal-kong-int-tst-ai-ue1-1059196812.us-east-1.elb.amazonaws.com"
URL="$BASE_URL/v1/chat/completions"

# Set KONG_API_KEY in your terminal if authentication is required.
API_KEY="${KONG_API_KEY:-}"

echo "=================================="
echo "Kong Multi-Model Routing Test"
echo "Endpoint: $URL"
echo "=================================="

test_model() {
    MODEL="$1"

    echo ""
    echo "Testing model: $MODEL"

    if [ -n "$API_KEY" ]; then
        curl -sS -i --max-time 30 -X POST "$URL" \
          -H "Content-Type: application/json" \
          -H "apikey: $API_KEY" \
          -d "{
            \"model\": \"$MODEL\",
            \"messages\": [
              {
                \"role\": \"user\",
                \"content\": \"Explain API Gateway in one sentence.\"
              }
            ]
          }"
    else
        curl -sS -i --max-time 30 -X POST "$URL" \
          -H "Content-Type: application/json" \
          -d "{
            \"model\": \"$MODEL\",
            \"messages\": [
              {
                \"role\": \"user\",
                \"content\": \"Explain API Gateway in one sentence.\"
              }
            ]
          }"
    fi

    echo ""
    echo "----------------------------------"
}

test_model "high-performance"
test_model "cost-optimized"

echo ""
echo "Multi-model routing tests completed."
