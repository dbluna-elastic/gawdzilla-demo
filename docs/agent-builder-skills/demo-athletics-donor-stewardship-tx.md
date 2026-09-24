---
id: demo-athletics-donor-stewardship-tx
name: Texas College donor stewardship
description: Use for Texas College athletic booster portfolio stats, at-risk donors, major gifts, affinity rankings, donor lookup, engagement events, case metrics, and alumni outreach email. Do not use for Oklahoma State indexes or gameday POS.
tool_ids:
  - booster-donor-portfolio-stats
  - booster-at-risk-donors
  - booster-donor-by-id
  - booster-at-risk-major-gifts
  - booster-alumni-email-workflow
---

# Texas College donor stewardship

## When to use

Activate for Texas College advancement questions about donor portfolio health, at-risk boosters, major gifts, affinity leaders, engagement event mix, case metrics, or alumni email drafts.

## Data & tools

- Indexes: `athletic-boosters`, `booster-engagement-events`, `booster-case-metrics`, `booster-donor-lookup`
- Also on agent: `booster-top-affinity-donors`, `booster-engagement-events-summary`, `booster-case-metrics`, `platform.core.get_document_by_id`

## Steps

1. Use the matching booster ES|QL tool; never query `okstate-*` indexes.
2. For email drafts, call `booster-alumni-email-workflow` with `donor_id`.
3. Ground numbers in tool results only.

## Do not use this skill for

- Oklahoma State donors (use OK State tools / `okstate-giving-policies`)
- Gameday revenue anomalies (use `demo-athletics-gameday-anomaly`)
