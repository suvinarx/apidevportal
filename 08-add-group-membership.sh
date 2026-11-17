#!/usr/bin/env bash
# Use case 8: AI Consumer Groups - group membership
#
# kongctl's declarative YAML has no field for AI Consumer Group membership
# (confirmed against Kong's docs and the kongctl declarative reference - it
# genuinely isn't modeled there). Membership is set with one direct call to
# the Konnect AI Gateway API instead:
#   PUT /ai-gateways/{gatewayId}/consumers/{consumerIdOrName}/consumer-groups
#   body: {"consumer_groups": [<group names>]}
# This is idempotent - it sets the FULL list of groups gamma-llc belongs to,
# so re-running this script is safe.
#
# Run this AFTER: kongctl apply -f 08-consumer-groups.yaml --auto-approve --pat "$KONNECT_TOKEN"
set -euo pipefail
: "${AI_GATEWAY_ID:?}"; : "${KONNECT_TOKEN:?}"
KONNECT_API_URL="${KONNECT_API_URL:-https://us.api.konghq.com}"

echo "=== Adding gamma-llc to the partner-tier AI Consumer Group ==="
curl -s --fail-with-body --no-progress-meter \
  -X PUT "$KONNECT_API_URL/v1/ai-gateways/$AI_GATEWAY_ID/consumers/gamma-llc/consumer-groups" \
  -H "Authorization: Bearer $KONNECT_TOKEN" \
  -H "Content-Type: application/json" \
  --json '{"consumer_groups": ["partner-tier"]}'
echo -e "\n\nDone. Verify with:"
echo "  kongctl get ai-gateway consumer-groups --gateway-id \$AI_GATEWAY_ID --pat \"\$KONNECT_TOKEN\""
echo "(If that subcommand name doesn't match your kongctl version, run"
echo " 'kongctl get ai-gateway --help' to find the right one.)"