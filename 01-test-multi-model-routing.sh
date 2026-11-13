#!/usr/bin/env bash
# Use case 1: Multi-model routing - regression test
# Two logical Kong AI Models, one endpoint, same Azure AI Foundry deployment.
set -euo pipefail

: "${APIKEY:?Export APIKEY first}"

# Accept a full endpoint URL or a base URL.
if [[ -n "${AI_GATEWAY_URL_router:-}" ]]; then
  ENDPOINT="$AI_GATEWAY_URL_router"
elif [[ -n "${KONNECT_PROXY_URL:-}" ]]; then
  ENDPOINT="${KONNECT_PROXY_URL%/}/v1/chat/completions"
else
  echo 'ERROR: Export AI_GATEWAY_URL_router (full endpoint) or KONNECT_PROXY_URL (base URL).' >&2
  exit 2
fi

CURL_OPTS=(-sS --connect-timeout 15 --max-time 90)
if [[ "${INSECURE_TLS:-false}" == "true" ]]; then
  CURL_OPTS+=(-k)
fi

RESULTS_DIR="multi-model-routing-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"
printf 'test_id,model,http_status,expected,result\n' > "$RESULTS_DIR/results.csv"

PASS=0
FAIL=0

run_test() {
  local test_id="$1" model="$2" expectation="$3"
  local response_file="$RESULTS_DIR/${test_id}.json"
  local headers_file="$RESULTS_DIR/${test_id}.headers.txt"
  local status result curl_rc=0

  printf '\n=== %s: model=%s (expected %s) ===\n' "$test_id" "$model" "$expectation"
  status=$(curl "${CURL_OPTS[@]}" -D "$headers_file" -o "$response_file" -w '%{http_code}' \
    -X POST "$ENDPOINT" \
    -H 'Content-Type: application/json' \
    -H "apikey: $APIKEY" \
    -d "{\"model\":\"$model\",\"messages\":[{\"role\":\"user\",\"content\":\"Explain what an API gateway does in one sentence.\"}],\"max_completion_tokens\":100}") || curl_rc=$?

  if [[ "$curl_rc" -ne 0 || "$status" == "000" ]]; then
    result=FAIL
  elif [[ "$expectation" == "200" && "$status" == "200" ]]; then
    result=PASS
  elif [[ "$expectation" == "non-200" && "$status" != "200" ]]; then
    result=PASS
  else
    result=FAIL
  fi

  printf 'HTTP %s | %s\n' "$status" "$result"
  if [[ -f "$response_file" ]]; then
    cat "$response_file"
    printf '\n'
  fi
  printf '%s,%s,%s,%s,%s\n' "$test_id" "$model" "$status" "$expectation" "$result" >> "$RESULTS_DIR/results.csv"
  if [[ "$result" == PASS ]]; then ((PASS+=1)); else ((FAIL+=1)); fi
}

echo "Endpoint: $ENDPOINT"
echo "Output: $RESULTS_DIR"
run_test MM-01 primary 200
run_test MM-02 secondary 200
run_test MM-03 invalid-model non-200

printf '\nSummary: PASS=%d FAIL=%d\n' "$PASS" "$FAIL"
echo "Report: $RESULTS_DIR/results.csv"
echo 'Note: Both logical models use the same Azure deployment; this tests routing rules, not multi-provider failover.'
[[ "$FAIL" -eq 0 ]]
