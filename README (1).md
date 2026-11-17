# Kong AI Gateway — Use Cases 07 & 08

## What does the script do?

`validate-ai-consumer-rate-limits.sh` sends four real chat-completion requests through the existing **sb-ai-gw** Kong AI Gateway to the **Azure Foundry GPT-5.4-mini** model. It tests two ways of assigning hourly token budgets:

| Use case | API consumer | Policy source | Expected limit |
| --- | --- | --- | --- |
| 01 | `acme-corp` | Consumer's Gold policy | 100,000 tokens/hour |
| 02 | `beta-inc` | Consumer's Standard policy | 20,000 tokens/hour |
| 03 | `gamma-llc` | `partner-tier` consumer group | 50,000 tokens/hour |

The script calls **Acme → Beta → Gamma → Acme again**. For every request, it checks for **HTTP 200** and the expected `X-AI-RateLimit-Limit-hour-policy-1` and `X-AI-RateLimit-Remaining-hour-policy-1` response headers. The second Acme call shows how its remaining balance changes over time. It prints PASS/FAIL and exits with an error if a request fails. **It does not deploy or modify gateway resources.**

## How to run

Open Terminal or Git Bash in the folder containing `validate-ai-consumer-rate-limits.sh`.

**1. Set the Data Plane proxy base URL** (replace the example with the working proxy address for your environment):

```bash
export KONNECT_PROXY_URL="https://YOUR-KONG-DATA-PLANE-HOST"
```

Use only the **base URL**. Do **not** append `/v1/chat/completions` or `/ai/v1/chat/completions` — the script appends the correct route. Do not use the Konnect management API URL.

**2. Load the existing API keys securely** (one prompt per key; input is hidden):

```bash
read -rsp "Acme API key: " ACME_CORP_API_KEY; echo
read -rsp "Beta API key: " BETA_INC_API_KEY; echo
read -rsp "Gamma API key: " GAMMA_LLC_API_KEY; echo
export ACME_CORP_API_KEY BETA_INC_API_KEY GAMMA_LLC_API_KEY
```

These must be the **same keys used when credentials were created**. Generating new random keys will not work unless the deployed credentials are updated.

**3. Run the tests:**

```bash
bash validate-ai-consumer-rate-limits.sh
```

If your test environment has an untrusted TLS certificate, you can temporarily set `export KONG_INSECURE_TLS=true` to bypass verification. Prefer fixing certificate trust instead; do not use this in production.

## What should I expect?

Example output (remaining balances will vary):

```text
PASS 07 Acme Gold | HTTP 200 | quota 100000/hour | remaining 99988
PASS 07 Beta Standard | HTTP 200 | quota 20000/hour | remaining 19988
PASS 08 Gamma Partner | HTTP 200 | quota 50000/hour | remaining 49966
PASS 07 Acme repeat | HTTP 200 | quota 100000/hour | remaining 99946

RESULT: PASS — 4 requests returned HTTP 200 and expected consumer/group quota headers.
```

A **PASS** means the request succeeded and Kong returned the expected quota and a numeric remaining-token balance. Each call consumes some tokens, so balances change between runs. The script also prints Acme's before/after balances. It does **not** prove strict consumer-counter isolation, a shared counter between multiple group members, or HTTP 429 when a limit is exhausted.

If a test fails, check the proxy URL, API key, model route, authentication strategy, consumer-policy assignment, and Gamma's group membership. `HTTP 503` with `name resolution failed` indicates a Data Plane/upstream DNS problem rather than a successful rate-limit test.

## How does this relate to real-world scenarios?

**Use Case 07 — Customer-specific quotas.** Imagine a SaaS company exposing one AI assistant to many business customers. **Acme (Gold)** purchases a higher allowance (100,000 tokens/hour), while **Beta (Standard)** receives 20,000 tokens/hour. Each company uses its own API key; Kong identifies the customer and applies the corresponding quota. This supports differentiated service tiers and helps limit one customer's usage without applying the same allowance to everyone.

**Use Case 08 — Shared organizational policy.** Imagine a partner organization with several apps or teams. Instead of attaching the same quota policy to each app separately, administrators place consumers into the **Partner Tier** group and manage a 50,000-token/hour policy at the group level. Gamma demonstrates that a group-assigned policy can be applied to a member. **This test does not establish whether multiple group members share a single counter**; that requires a separate test with at least two members.

## What was configured in the POC?

- **Existing infrastructure reused:** `sb-ai-gw`, Azure Foundry model `azure-gpt-5.4-mini`, route `/ai/v1`, and `ai-key-auth` (header `apikey`).
- **Use Case 07:** Created consumers `acme-corp` and `beta-inc`, generated API-key credentials, created `consumer-limit-gold` and `consumer-limit-standard` policies, and assigned the corresponding policy to each consumer.
- **Use Case 08:** Created `partner-tier-limit` (50,000 tokens/hour), created `partner-tier`, created `gamma-llc` and its API-key credential, and tested Gamma with the group quota.
- **Observed runtime results:** Acme HTTP 200 / quota 100,000; Beta HTTP 200 / quota 20,000; Gamma HTTP 200 / quota 50,000.

**Scope:** This is a smoke test for policy selection and successful AI requests. It does not intentionally exhaust quotas, change configuration, or test production capacity.
