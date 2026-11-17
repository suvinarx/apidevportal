# Kong AI Gateway — Consumer & Group Rate Limiting (UC-07 & UC-08)

## Overview

This test validates consumer- and group-specific token rate limits in the Kong AI Gateway (`sb-ai-gw`). It sends requests to the `azure-gpt-5.4-mini` model using different consumer credentials and checks the HTTP status, hourly quota, and remaining quota reported by the gateway.

**Script:** `validate-ai-consumer-rate-limits.sh`

## What the script tests

- **UC-07 — Consumer-specific limits:** Acme Gold (100,000 tokens/hour) and Beta Standard (20,000 tokens/hour) receive their configured quotas.
- **UC-08 — Partner/group limit:** Gamma Partner receives its configured 50,000 tokens/hour quota.
- **Repeat request:** Acme is tested again after Beta and Gamma to observe how its remaining quota changes.

All requests target the same AI model, so the test focuses on policy selection and quota reporting rather than model comparison.

## How to run

In Windows Git Bash, navigate to the directory containing the script and set the environment variables required by your script, including the consumer API keys. Do not put real keys in this README or commit them to Git.

Set the gateway base URL if your script uses `AI_GATEWAY_URL`:

```bash
export AI_GATEWAY_URL="https://internal-kong-int-tst-ai-ue1-1059196812.us-east-1.elb.amazonaws.com"
```

**Important:** The final request endpoint must contain `/ai/v1` only once:

```text
https://internal-kong-int-tst-ai-ue1-1059196812.us-east-1.elb.amazonaws.com/ai/v1/chat/completions
```

If your script expects the full endpoint rather than a base URL, configure it accordingly. Confirm the script's variable names before running.

```bash
chmod +x validate-ai-consumer-rate-limits.sh
./validate-ai-consumer-rate-limits.sh
```

The test environment previously required bypassing TLS certificate verification because the internal load balancer hostname did not match the presented certificate. If the script uses `curl -k`, keep that exception limited to this internal test environment; use a correctly matched TLS certificate for production.

## Expected results

| Test | Scenario | Expected HTTP | Expected hourly quota |
|---|---|---:|---:|
| UC-07 | Acme Gold | 200 | 100,000 |
| UC-07 | Beta Standard | 200 | 20,000 |
| UC-08 | Gamma Partner | 200 | 50,000 |
| UC-07 | Acme repeat | 200 | 100,000 |

Each response should report the expected quota and a remaining-quota value.

## Actual results — November 16, 2026 (Pacific) / November 17 (UTC)

| Test | Scenario | HTTP | Reported quota/hour | Remaining | Result |
|---|---|---:|---:|---:|---|
| UC-07 | Acme Gold | 200 | 100,000 | 99,988 | PASS |
| UC-07 | Beta Standard | 200 | 20,000 | 19,988 | PASS |
| UC-08 | Gamma Partner | 200 | 50,000 | 49,987 | PASS |
| UC-07 | Acme repeat | 200 | 100,000 | 99,967 | PASS |

**Result: PASS — 4 of 4 requests returned HTTP 200 with the expected quota values.**

Acme's remaining quota decreased from 99,988 to 99,967 across the test sequence. This is consistent with quota consumption but does not, by itself, prove isolation from other consumers.

## Real-world use

- **Gold customers:** Higher hourly AI token allowances for premium applications.
- **Standard customers:** Lower limits to control consumption and cost.
- **Partners:** A distinct quota policy for partner traffic.
- **Repeated calls:** Monitoring remaining capacity as requests consume tokens.

These policies help a shared AI Gateway serve multiple applications with different consumption limits.

## What this test does not prove

- That requests exceeding a quota receive **HTTP 429**.
- That multiple consumers in the same group share a single counter.
- That counters are strictly isolated across consumers.

Those behaviors require additional targeted tests.

## Troubleshooting

| Symptom | Check |
|---|---|
| HTTP 404 | Verify the endpoint path; avoid duplicate `/ai/v1` segments. |
| HTTP 401 | Verify the API key is present and valid. |
| HTTP 403 | Inspect authorization and gateway policy responses. |
| HTTP 429 | Check whether the applicable rate limit has been exceeded. |
| HTTP 503 | Check gateway/upstream model availability. |
| TLS certificate error | Check hostname/certificate matching; `curl -k` is only a temporary internal diagnostic workaround. |
| Quota headers missing | Inspect response status, consumer identity, and rate-limit policy configuration. |

## Summary

UC-07 and UC-08 passed the currently implemented checks for consumer/group quota selection and reporting on `azure-gpt-5.4-mini`. Exhaustion enforcement and shared-group counter behavior remain unverified.
