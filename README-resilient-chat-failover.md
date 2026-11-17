# UC-02 — Resilient Chat: AI Gateway Failover

## What this tests

This POC tests whether Kong AI Gateway can retry a chat-completion request against a backup target after an eligible failure from the preferred target, without client-side retry logic.

- Gateway: `sb-ai-gw`
- Logical AI Model: `resilient-chat`
- Endpoint: `POST /v1-resilient/chat/completions`
- Provider: `azurefoundry`
- Working Azure deployment: `gpt-5.4-mini`
- Authentication: `apikey` header (`ai-key-auth`)
- Balancer: `priority`, with primary weight 100 and backup weight 10

**Scope:** Both targets use the same Azure provider/deployment for this controlled POC. This does **not** demonstrate resilience to a complete Azure service or shared deployment outage.

## How to run

Set the environment variables in macOS Bash/zsh or Windows Git Bash:

```bash
export KONNECT_PROXY_URL="https://YOUR-GATEWAY-HOST"
export APIKEY="YOUR_API_KEY"
```

Call the logical model:

```bash
curl -k -sS -w '\nHTTP Status: %{http_code}\n' \
  -X POST "$KONNECT_PROXY_URL/v1-resilient/chat/completions" \
  -H 'Content-Type: application/json' \
  -H "apikey: $APIKEY" \
  -d '{
    "model": "resilient-chat",
    "messages": [{"role": "user", "content": "Explain API Gateway failover in one sentence."}],
    "max_completion_tokens": 100
  }'
```

`-k` skips TLS certificate verification for the internal POC endpoint only. Remove it when DNS and certificates are configured correctly.

## Test cases — expected vs. received

| ID | Scenario | Expected | Received so far | Status |
|---|---|---|---|---|
| FO-01 | Both targets point to valid `gpt-5.4-mini` | HTTP 200 | HTTP 200 | **PASS** |
| FO-02 | Primary deployment ID deliberately invalid; backup valid | Primary fails, backup succeeds; client receives HTTP 200 | Not reported | **PENDING** |
| FO-03 | Inspect gateway logs/traces for FO-02 | Failed primary attempt followed by successful backup attempt | Not reported | **PENDING** |
| FO-04 | Restore valid primary deployment | HTTP 200 | Not reported | **PENDING** |
| FO-05 | Both targets invalid | Non-200 failure after eligible retry attempts | Not tested | **OPTIONAL** |

**Important:** HTTP 200 in FO-02 alone is not proof of failover: the balancer might have selected the healthy target first. Confirm target attempts using gateway logs or tracing.

## Failover configuration

The planned `resilient-chat` balancer settings are:

```yaml
balancer:
  algorithm: priority
  retries: 3
  failover_criteria:
    - error
    - timeout
    - http_404
    - http_429
    - http_500
    - http_502
    - http_503
    - non_idempotent
  max_fails: 1
  fail_timeout: 30000
```

`http_404` is relevant to a deliberately nonexistent Azure deployment. `non_idempotent` is included because chat completion requests are POSTs; retries of POSTs may duplicate processing if the first attempt reached the upstream. The actual runtime behavior must be verified.

## Controlled failure procedure

1. Keep the existing `primary`, `secondary`, and `azure-gpt-5.4-mini` AI Models unchanged.
2. In `02-failover.yaml`, change **only the preferred target's** `deployment_id` from `gpt-5.4-mini` to `invalid-gpt-deployment`; keep the backup target valid.
3. Preview changes:

   ```bash
   kongctl apply -f 02-failover.yaml --dry-run --pat "$KONNECT_TOKEN"
   ```

4. Verify the plan changes only `resilient-chat`, then apply:

   ```bash
   kongctl apply -f 02-failover.yaml --auto-approve --pat "$KONNECT_TOKEN"
   ```

5. Repeat the curl request above. Capture the HTTP response and gateway logs/traces.
6. **Restore the original primary deployment ID** and reapply the YAML after the test.

To inspect the model configuration:

```bash
kongctl get ai-gateway models --gateway-name sb-ai-gw \
  --output json --pat "$KONNECT_TOKEN" \
  | jq '.[] | select(.name == "resilient-chat") | {name, enabled, targets, balancer: .config.balancer, route: .config.route}'
```

## Real-world relevance

A client continues calling the same endpoint with `"model": "resilient-chat"`. If the preferred upstream encounters a configured retryable failure, Kong can attempt a backup target transparently. For production resilience, use a genuinely independent healthy deployment or provider, test all failure criteria, monitor retries and costs, and avoid retrying requests where duplicate execution would be harmful.

## Current outcome

**Baseline routing is validated (FO-01). Automatic failover is not yet confirmed** from the results shared so far. Do not label UC-02 fully completed until the failure-injection test and target-level evidence are collected.
