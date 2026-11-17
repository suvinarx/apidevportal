# UC-01 — Multi-Model Request Routing

## What this test does

Tests **Kong Konnect AI Gateway `sb-ai-gw`** routing two logical AI Models through the **same client-facing endpoint**. Kong uses the JSON request body's `model` field to select the configured AI Model. The client uses the same URL, API key, and OpenAI-compatible request format for both models.

| Logical AI Model | Route | Body routing rule | Upstream target |
|---|---|---|---|
| `primary` | `/v1/chat/completions` | `model: primary` | Azure AI Foundry `gpt-5.4-mini` |
| `secondary` | `/v1/chat/completions` | `model: secondary` | Azure AI Foundry `gpt-5.4-mini` |

The existing `azure-gpt-5.4-mini` model on `/ai/v1` is not changed by this test.

## How to run

Set the full endpoint and API key in macOS Bash/zsh or Windows Git Bash:

```bash
export AI_GATEWAY_URL_router="https://YOUR-GATEWAY-HOST/v1/chat/completions"
export APIKEY="YOUR_API_KEY"

# Only for the internal POC if the gateway TLS hostname does not match its certificate:
export INSECURE_TLS=true

bash 01-test-multi-model-routing.sh
```

Alternatively, set the base URL instead of the full endpoint:

```bash
export KONNECT_PROXY_URL="https://YOUR-GATEWAY-HOST"
export APIKEY="YOUR_API_KEY"
bash 01-test-multi-model-routing.sh
```

If both URL variables are set, `AI_GATEWAY_URL_router` takes precedence. The script requires Bash and curl; it does **not** require jq. `INSECURE_TLS=true` disables TLS certificate verification for this POC only. Fix the hostname/certificate mismatch before production use.

## What to expect — all three test cases

| Test ID | Request body `model` | Expected HTTP | Previously received | Outcome |
|---|---|---|---|---|
| MM-01 | `primary` | `200` | `200` | **PASS** |
| MM-02 | `secondary` | `200` | `200` | **PASS** |
| MM-03 | `invalid-model` | Non-`200` | Non-`200` (exact code not recorded) | **PASS** |

The results above reflect the previous manual execution, not a new execution of this script. The negative test checks only for non-200; inspect its response body to determine the precise reason for rejection.

Expected console summary after a successful run:

```text
=== MM-01: model=primary (expected 200) ===
HTTP 200 | PASS
=== MM-02: model=secondary (expected 200) ===
HTTP 200 | PASS
=== MM-03: model=invalid-model (expected non-200) ===
HTTP <non-200> | PASS
Summary: PASS=3 FAIL=0
```

The script prints the response bodies and creates a timestamped directory such as `multi-model-routing-YYYYMMDD-HHMMSS/` containing:

- `results.csv` — test ID, model, HTTP status, expected status, PASS/FAIL
- `MM-01.json`, `MM-02.json`, `MM-03.json` — response bodies
- `MM-01.headers.txt`, `MM-02.headers.txt`, `MM-03.headers.txt` — response headers

## How this maps to a real-world scenario

An application can send requests to one gateway endpoint while choosing a logical AI Model using the `model` field. Kong applies the corresponding model route without requiring the client to change its gateway URL or authentication method. In a larger deployment, these logical models could point to different deployments or providers.

**Scope of this POC:** Both `primary` and `secondary` currently point to the **same Azure AI Foundry deployment** (`gpt-5.4-mini`). This proves request-body-based **logical model selection**, not selection between different physical LLMs and not automatic failover. Because both targets are the same deployment, the returned model identity cannot independently prove which logical route matched; the deployed route configuration and invalid-model test provide supporting evidence.

## Troubleshooting

- **401/403:** Verify `APIKEY` and the `ai-key-auth` configuration.
- **404/503 or other non-200 for primary/secondary:** Check the endpoint path, deployed model routing rules, provider target, and response body.
- **TLS hostname error:** For the internal POC only, set `INSECURE_TLS=true`; use a correctly named certificate for production.
- **No response / HTTP 000:** Check network/VPN connectivity, DNS, and the gateway listener.

## Configuration verification

From a machine with `kongctl`, `jq`, and a valid Konnect token:

```bash
kongctl get ai-gateway models \
  --gateway-name sb-ai-gw \
  --output json \
  --pat "$KONNECT_TOKEN" \
  | jq '.[] | select(.name == "primary" or .name == "secondary") | {name, enabled, route: .config.route, targets}'
```

Confirm both are enabled, use path `/v1`, and have `config.route.model.body_param: model` with their respective values.
