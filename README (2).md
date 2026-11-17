# Allstate Kong AI Gateway — Test Scripts

This repository contains scripts for validating AI Gateway routing, security guardrails, rate limiting, and model resilience in the `sb-ai-gw` proof of concept.

| Script | What it does |
|---|---|
| `kong_guardrails.sh` | Tests AI guardrails against prompt injection, jailbreak attempts, indirect injection, and encoded prompts. |
| `test-kong-guardrails-bash.sh` | Runs additional guardrail checks to verify malicious prompts are rejected and legitimate requests are handled appropriately. |
| `test-multi-model-routing.sh` | Sends requests to the `high-performance` and `cost-optimized` logical models to validate model-based routing. |
| `validate-ai-consumer-rate-limits.sh` | Validates UC-07 and UC-08: consumer-specific and group-based token quotas for Gold, Standard, and Partner applications. |
| `test-model-resilience.sh` | Tests primary-model failure and fallback-model behavior. **Verify the filename against the actual script in the repository.** |

> **Note:** Script names reflect the scripts discussed during the POC. Confirm filenames in the repository before running them. The rate-limiting test previously returned 4/4 passing checks; that does not establish that every other test suite has passed.
