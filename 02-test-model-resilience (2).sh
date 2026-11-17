#!/usr/bin/env bash
# UC-02 — Kong AI Gateway model resilience / failover tests
# Read-only test harness: NEVER modifies gateway configuration.
set -uo pipefail

BASE_URL="${KONNECT_PROXY_URL:-${GATEWAY_BASE_URL:-}}"
ENDPOINT="${FAILOVER_URL:-${BASE_URL%/}/v1-resilient/chat/completions}"
MODEL="${MODEL:-resilient-chat}"
OUT_DIR="${OUT_DIR:-model-resilience-$(date +%Y%m%d-%H%M%S)}"
INSECURE_TLS="${INSECURE_TLS:-false}"
MAX_COMPLETION_TOKENS="${MAX_COMPLETION_TOKENS:-100}"

if [[ -z "${FAILOVER_URL:-}" && -z "$BASE_URL" ]]; then
  echo 'ERROR: export KONNECT_PROXY_URL (gateway base URL) or FAILOVER_URL (full endpoint)' >&2
  exit 2
fi
if [[ -z "${APIKEY:-}" && -z "${GATEWAY_BEARER_TOKEN:-}" ]]; then
  echo 'ERROR: export APIKEY or GATEWAY_BEARER_TOKEN' >&2
  exit 2
fi
command -v curl >/dev/null || { echo 'ERROR: curl is required' >&2; exit 2; }
mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/results.csv"
printf 'test_id,phase,expected_http,actual_http,result,latency_seconds,response_file,notes\n' > "$REPORT"

curl_opts=(-sS --connect-timeout 15 --max-time 120)
[[ "$INSECURE_TLS" == "true" ]] && curl_opts+=(-k)
auth=(-H "apikey: ${APIKEY:-}")
[[ -n "${GATEWAY_BEARER_TOKEN:-}" ]] && auth=(-H "Authorization: Bearer $GATEWAY_BEARER_TOKEN")

run_case() {
  local id="$1" phase="$2" note="$3" expected="$4"
  local body="$OUT_DIR/${id}.json" headers="$OUT_DIR/${id}.headers" request="$OUT_DIR/${id}.request.json"
  local result status elapsed verdict
  printf '{"model":"%s","messages":[{"role":"user","content":"Explain API Gateway failover in one sentence."}],"max_completion_tokens":%s}\n' "$MODEL" "$MAX_COMPLETION_TOKENS" > "$request"
  echo ""
  echo "=== $id: $phase ==="
  echo "Endpoint: $ENDPOINT"
  result=$(curl "${curl_opts[@]}" -D "$headers" -o "$body" -w '%{http_code},%{time_total}' \
    -X POST "$ENDPOINT" -H 'Content-Type: application/json' "${auth[@]}" \
    --data-binary "@$request")
  local curl_rc=$?
  status="${result%%,*}"
  elapsed="${result#*,}"
  if [[ $curl_rc -ne 0 || "$status" == '000' ]]; then
    verdict='FAIL'
    note="curl error ($curl_rc); $note"
  elif [[ "$expected" == '200' && "$status" == '200' ]]; then
    verdict='PASS'
  elif [[ "$expected" == 'non-200' && "$status" != '200' ]]; then
    verdict='PASS'
  else
    verdict='FAIL'
  fi
  printf '%s,%s,%s,%s,%s,%s,%s,%s\n' "$id" "$phase" "$expected" "$status" "$verdict" "$elapsed" "$body" "$note" >> "$REPORT"
  echo "HTTP $status | $verdict | ${elapsed}s"
  echo "Response: $body"
  if [[ -f "$body" ]]; then
    cat "$body"
    echo
  fi
}

case "${1:-baseline}" in
  baseline)
    run_case FO-01 baseline 'Both targets configured healthy; status does not prove which target served request' 200
    ;;
  failure)
    echo 'Confirm that primary deployment_id is intentionally invalid, backup remains healthy,'
    echo 'and priority balancer includes http_404 and non_idempotent in failover_criteria.'
    read -r -p 'Run failover test against current gateway configuration? [y/N] ' answer
    [[ "$answer" =~ ^[Yy]$ ]] || { echo 'Cancelled.'; exit 0; }
    run_case FO-02 failure-injection 'HTTP 200 is only client-level success; inspect gateway logs for failed primary then backup' 200
    ;;
  recovery)
    echo 'Confirm that the primary deployment_id has been restored and applied.'
    read -r -p 'Run recovery test? [y/N] ' answer
    [[ "$answer" =~ ^[Yy]$ ]] || { echo 'Cancelled.'; exit 0; }
    run_case FO-04 recovery 'HTTP 200 confirms service recovery; check logs for primary target selection' 200
    ;;
  both-down)
    echo 'CAUTION: run only in an isolated POC after intentionally disabling both targets.'
    read -r -p 'Run both-targets-down test? [y/N] ' answer
    [[ "$answer" =~ ^[Yy]$ ]] || { echo 'Cancelled.'; exit 0; }
    run_case FO-05 both-unavailable 'Expected rejection; restore both targets immediately afterward' non-200
    ;;
  *)
    echo 'Usage: bash 02-test-model-resilience.sh {baseline|failure|recovery|both-down}' >&2
    exit 2
    ;;
esac

echo ""
echo "Results: $REPORT"
echo 'NOTE: FO-03 (proof of target-to-target failover) requires gateway logs or tracing.'
