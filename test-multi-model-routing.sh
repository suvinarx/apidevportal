#!/usr/bin/env bash
# Kong AI Gateway logical multi-model routing test (Git Bash compatible)
set -uo pipefail

: "${AI_GATEWAY_BASE_URL:?Set AI_GATEWAY_BASE_URL to the gateway host URL (without /v1)}"
: "${KONG_API_KEY:?Set KONG_API_KEY to the gateway API key}"

BASE="${AI_GATEWAY_BASE_URL%/}"
URL="${BASE}/v1/chat/completions"
OUT="multi-model-routing-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"
printf 'test,model,http_code,expected,result,duration_seconds\n' > "$OUT/results.csv"

run_test() {
  local id="$1" model="$2" expected="$3" prompt="$4"
  local body="$OUT/${id}.json" headers="$OUT/${id}.headers" payload="$OUT/${id}.request.json"
  jq -n --arg model "$model" --arg prompt "$prompt" '{model:$model,messages:[{role:"user",content:$prompt}],max_tokens:120}' > "$payload"
  local metrics status elapsed result
  metrics=$(curl -sS -X POST "$URL" -H 'Content-Type: application/json' -H "apikey: $KONG_API_KEY" --data-binary "@$payload" -D "$headers" -o "$body" -w '%{http_code} %{time_total}' 2>"$OUT/${id}.curl-error")
  local curl_rc=$?
  read -r status elapsed <<< "$metrics"
  status="${status:-000}"; elapsed="${elapsed:-0}"
  result=FAIL
  if [[ "$curl_rc" -eq 0 ]]; then
    if [[ "$expected" == '200' && "$status" == '200' ]]; then
      # Ensure the successful response actually contains a chat completion.
      if jq -e '.choices[0].message.content != null' "$body" >/dev/null 2>&1; then result=PASS; fi
    elif [[ "$expected" == '4xx' && "$status" =~ ^4[0-9][0-9]$ ]]; then
      result=REVIEW # Rejection may be due to a policy, not model selection.
    fi
  fi
  printf '%s,%s,%s,%s,%s,%s\n' "$id" "$model" "$status" "$expected" "$result" "$elapsed" >> "$OUT/results.csv"
  printf '%-7s %-22s HTTP %-3s expected %-3s %-6s %ss\n' "$id" "$model" "$status" "$expected" "$result" "$elapsed"
  if [[ "$result" != PASS ]]; then
    printf '  Response: '; jq -c '.error // .message // .' "$body" 2>/dev/null | head -c 350 || true; printf '\n'
  fi
}

printf 'Kong multi-model routing test\nEndpoint: %s\nOutput: %s\n\n' "$URL" "$OUT"
run_test MM-01 high-performance 200 'Explain what an API gateway does in one sentence.'
run_test MM-02 cost-optimized 200 'Explain what an API gateway does in one sentence.'
run_test MM-03 invalid-routing-model 4xx 'Say hello.'
printf '\nResults: %s/results.csv\n' "$OUT"
printf 'Note: MM-03 REVIEW requires inspecting the response body to verify model-specific rejection.\n'
