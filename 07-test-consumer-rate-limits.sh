#!/usr/bin/env bash
# Use case 7: Per-consumer token rate limiting - test script
#
# Same route, same model, two different callers (Acme Corp / gold tier,
# Beta Inc / standard tier), identified by their own api-key credential.
# Standard tier's 20,000 tokens/hour budget is still miles above what a few
# demo calls will use, so this script doesn't try to actually exhaust a
# budget live (that would take a lot of real LLM calls). Instead it proves
# the two callers are tracked SEPARATELY by showing each one's own
# X-AI-RateLimit-* remaining-tokens header move independently as you call it,
# while the other caller's counter stays untouched.
set -euo pipefail
: "${KONNECT_PROXY_URL:?}"; : "${ACME_CORP_API_KEY:?}"; : "${BETA_INC_API_KEY:?}"

REQ='{"model":"consumer-demo-model","messages":[{"role":"user","content":"Say hello in five words."}]}'

call() {
  local label="$1" apikey="$2"
  echo "--- $label ---"
  curl -s -D /tmp/consumer-headers.txt -o /tmp/consumer-body.json \
    -X POST "$KONNECT_PROXY_URL/v1-consumers/chat/completions" \
    -H "Content-Type: application/json" \
    -H "apikey: $apikey" \
    --json "$REQ"
  grep -i "^x-ai-ratelimit" /tmp/consumer-headers.txt || echo "(no X-AI-RateLimit-* headers yet - see note below)"
  echo
}

echo "=== Polling until the config has propagated to the data plane (up to ~30s) ==="
STATUS=""
for i in $(seq 1 15); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$KONNECT_PROXY_URL/v1-consumers/chat/completions" \
    -H "Content-Type: application/json" -H "apikey: $ACME_CORP_API_KEY" \
    --json "$REQ" || true)
  if [ "$STATUS" = "200" ]; then
    echo "(live after ~$((i * 2))s)"
    break
  fi
  sleep 2
done
if [ "$STATUS" != "200" ]; then
  echo "Still getting HTTP $STATUS after ~30s - check:"
  echo "  kongctl get ai-gateway consumers --gateway-id \$AI_GATEWAY_ID --pat \"\$KONNECT_TOKEN\""
  echo "  kongctl get ai-gateway models    --gateway-id \$AI_GATEWAY_ID --pat \"\$KONNECT_TOKEN\""
fi
echo

echo "=== 1) Acme Corp (gold tier, 100,000 tokens/hr) - call #1 ==="
call "Acme Corp" "$ACME_CORP_API_KEY"

echo "=== 2) Beta Inc (standard tier, 20,000 tokens/hr) - call #1 ==="
call "Beta Inc" "$BETA_INC_API_KEY"

echo "=== 3) Acme Corp again - call #2 (its own counter should have moved again;" \
     "Beta Inc's counter is untouched by this call) ==="
call "Acme Corp" "$ACME_CORP_API_KEY"

echo "Observation: same route (/v1-consumers), same model, two callers identified by their"
echo "own api-key credential. Each one's X-AI-RateLimit-Remaining-* moves independently -"
echo "because the ai-rate-limiting-advanced policy is attached directly to that AI Consumer"
echo "(acme-corp -> consumer-limit-gold, beta-inc -> consumer-limit-standard), not the model."
echo "A caller with no valid apikey gets rejected before ever reaching either budget - try:"
echo "  curl -s -o /dev/null -w '%{http_code}\n' -X POST \"\$KONNECT_PROXY_URL/v1-consumers/chat/completions\" \\"
echo "    -H 'Content-Type: application/json' --json '$REQ'"