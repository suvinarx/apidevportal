# Multi-Model Routing (High Performance / Cost Optimized)

## What the script demonstrates

Kong AI Gateway exposes one OpenAI-compatible endpoint and routes each request to a logical AI Model based on the JSON `model` field. Clients use the same URL, API key, and payload structure; only `model` changes.

- `high-performance`: intended for complex reasoning and analysis.
- `cost-optimized`: intended for routine questions and summaries.

**POC  :** Both logical models currently point to the **same Azure AI Foundry `gpt-5.4-mini` deployment**. These labels just describe intended workload tiers; they do not yet establish different cost, latency, or model capability.

## Deployed configuration

| Kong model name | Route | Target | Status shown in Konnect |
|---|---|---|---|
| `high-performance` | `/v1` | AzureFoundry `gpt-5.4-mini` | Enabled |
| `cost-optimized` | `/v1` | AzureFoundry `gpt-5.4-mini` | Enabled |



- Gateway: `sb-ai-gw`
- Endpoint: `POST /v1/chat/completions`
- Authentication: `apikey` HTTP header
- Routing selector: request body `model`
- Provider: `azurefoundry`

## How to run

Export environment variables in macOS Bash/zsh or Windows Git Bash:

```bash
export KONNECT_PROXY_URL="https://YOUR-GATEWAY-HOST"
export APIKEY="YOUR_API_KEY"
```

For the known internal POC hostname/certificate mismatch, the sample curl commands use `-k`. Remove `-k` when DNS and TLS certificates are correctly configured. Never commit API keys.

Run the three tests:

```bash
for MODEL in high-performance cost-optimized invalid-model; do
  echo "=== Testing $MODEL ==="
  curl -ksS -o "${MODEL}.json" -w 'HTTP %{http_code}\n' \
    -X POST "$KONNECT_PROXY_URL/v1/chat/completions" \
    -H 'Content-Type: application/json' \
    -H "apikey: $APIKEY" \
    -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"Explain an API gateway in one sentence.\"}],\"max_completion_tokens\":100}"
  cat "${MODEL}.json"
  echo
 done
```

## What to expect — expected vs. received

| Test | Scenario | Expected | Received for **current names** | Status |
|---|---|---|---|---|
| MM-01 | `high-performance` | HTTP 200 and model response | Not yet reported | Pending runtime verification |
| MM-02 | `cost-optimized` | HTTP 200 and model response | Not yet reported | Pending runtime verification |
| MM-03 | `invalid-model` | Non-200, no matching model | Not yet reported after rename | Pending runtime verification |

**Earlier evidence:** The former `primary` and `secondary` requests each returned HTTP 200, and `invalid-model` returned non-200 before the rename. Those historical results demonstrate the original routing setup but should **not** be presented as execution results for the newly named models.



## Real-world relevance

A client can request a high-performance or cost-optimized logical tier without changing endpoints or provider SDKs. Once separate deployments are provisioned, Kong can map these tiers to genuinely different models while preserving the client-facing contract.
