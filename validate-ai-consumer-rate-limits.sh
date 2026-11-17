#!/usr/bin/env bash
# Kong AI Gateway 2.0 — Use Cases 07 & 08 smoke tests
# Works in macOS Bash and Windows Git Bash. No jq dependency.
set -uo pipefail

MODEL="${AI_MODEL_NAME:-azure-gpt-5.4-mini}"
ROUTE="${AI_MODEL_ROUTE:-/ai/v1/chat/completions}"
CONNECT_TIMEOUT="${CONNECT_TIMEOUT:-15}"
MAX_TIME="${MAX_TIME:-90}"
TLS_ARGS=()
if [[ "${KONG_INSECURE_TLS:-false}" == "true" ]]; then TLS_ARGS=(-k); fi

if [[ -z "${KONNECT_PROXY_URL:-}" ]]; then
  echo 'ERROR: KONNECT_PROXY_URL is not set. Set it to the proxy BASE URL (no /v1/chat/completions path).' >&2
  exit 2
fi
if [[ ! "$KONNECT_PROXY_URL" =~ ^https?:// ]]; then
  echo 'ERROR: KONNECT_PROXY_URL must start with http:// or https://' >&2
  exit 2
fi
if [[ "$KONNECT_PROXY_URL" == *'/chat/completions'* ]]; then
  echo 'ERROR: KONNECT_PROXY_URL contains a chat/completions path. Use the base URL only.' >&2
  exit 2
fi
for name in ACME_CORP_API_KEY BETA_INC_API_KEY GAMMA_LLC_API_KEY; do
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: $name is missing. Load the ORIGINAL deployed key; do not generate a replacement." >&2
    exit 2
  fi
done
if ! command -v curl >/dev/null 2>&1; then echo 'ERROR: curl is required.' >&2; exit 2; fi

BASE="${KONNECT_PROXY_URL%/}"
URL="${BASE}${ROUTE}"
WORK_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t kong-uc-tests)"
trap 'rm -rf "$WORK_DIR"' EXIT
FAIL=0
ACME_BEFORE=''
ACME_AFTER=''
BETA_REMAIN=''
GAMMA_REMAIN=''

# Prints only status/quota; never prints or logs API keys or full model responses.
run_case() {
  local label="$1" key="$2" expected="$3" prompt="$4" prefix="$5"
  local headers="$WORK_DIR/${prefix}.headers" body="$WORK_DIR/${prefix}.body"
  local payload status rc limit remaining response_status
  payload=$(printf '{"model":"%s","messages":[{"role":"user","content":"%s"}],"max_tokens":30}' "$MODEL" "$prompt")
  status=$(curl -sS "${TLS_ARGS[@]}" --connect-timeout "$CONNECT_TIMEOUT" --max-time "$MAX_TIME" \
    -D "$headers" -o "$body" -w '%{http_code}' \
    -H 'Content-Type: application/json' -H "apikey: $key" \
    --data "$payload" "$URL")
  rc=$?
  if [[ $rc -ne 0 ]]; then
    echo "FAIL $label: curl exit=$rc; HTTP=${status:-unknown}"
    FAIL=$((FAIL+1))
    return
  fi
  # Last occurrence handles intermediate proxy responses. Remove CR for Git Bash/Windows.
  limit=$(tr -d '\r' < "$headers" | awk -F ': *' 'tolower($1)=="x-ai-ratelimit-limit-hour-policy-1" {v=$2} END{print v}')
  remaining=$(tr -d '\r' < "$headers" | awk -F ': *' 'tolower($1)=="x-ai-ratelimit-remaining-hour-policy-1" {v=$2} END{print v}')
  response_status="$status"
  if [[ "$response_status" == "200" && "$limit" == "$expected" && "$remaining" =~ ^[0-9]+$ && "$remaining" -le "$expected" ]]; then
    echo "PASS $label | HTTP $response_status | quota $limit/hour | remaining $remaining"
  else
    echo "FAIL $label | HTTP $response_status | quota ${limit:-missing} (expected $expected) | remaining ${remaining:-missing}"
    echo "     Check proxy routing, consumer key, group membership, policies, and model auth strategy."
    FAIL=$((FAIL+1))
  fi
  case "$prefix" in
    acme_before) ACME_BEFORE="$remaining" ;;
    acme_after) ACME_AFTER="$remaining" ;;
    beta) BETA_REMAIN="$remaining" ;;
    gamma) GAMMA_REMAIN="$remaining" ;;
  esac
}

printf 'Kong AI Gateway — Use Case 07 & 08 runtime tests\n'
printf 'Endpoint: %s\nModel: %s\n\n' "$URL" "$MODEL"
if [[ "${KONG_INSECURE_TLS:-false}" == "true" ]]; then
  echo 'WARNING: TLS certificate verification is disabled (KONG_INSECURE_TLS=true).'
fi

run_case '07 Acme Gold' "$ACME_CORP_API_KEY" 100000 'Reply with exactly: Acme test successful' acme_before
run_case '07 Beta Standard' "$BETA_INC_API_KEY" 20000 'Reply with exactly: Beta test successful' beta
run_case '08 Gamma Partner' "$GAMMA_LLC_API_KEY" 50000 'Reply with exactly: Gamma group test successful' gamma
run_case '07 Acme repeat' "$ACME_CORP_API_KEY" 100000 'Reply with exactly: Acme isolation verified' acme_after

printf '\nCounter observations:\n'
printf '  Acme first=%s, after Beta and Gamma=%s\n' "${ACME_BEFORE:-unavailable}" "${ACME_AFTER:-unavailable}"
printf '  Beta remaining=%s; Gamma remaining=%s\n' "${BETA_REMAIN:-unavailable}" "${GAMMA_REMAIN:-unavailable}"
if [[ "$ACME_BEFORE" =~ ^[0-9]+$ && "$ACME_AFTER" =~ ^[0-9]+$ ]]; then
  if (( ACME_AFTER <= ACME_BEFORE )); then
    echo 'PASS Acme counter is non-increasing across tests (supports independent tracking; not a strict isolation proof).'
  else
    echo 'INFO Acme counter increased; the sliding window may have rolled/reset. Not an isolation failure by itself.'
  fi
else
  echo 'INFO Acme counter comparison unavailable.'
fi

printf '\n'
if (( FAIL == 0 )); then
  echo 'RESULT: PASS — 4 requests returned HTTP 200 and expected consumer/group quota headers.'
  echo 'NOTE: This does not prove HTTP 429 exhaustion or shared group counter behavior.'
  exit 0
else
  echo "RESULT: FAIL — $FAIL request(s) did not meet expected HTTP/quota checks."
  exit 1
fi
