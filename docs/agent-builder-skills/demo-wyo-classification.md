---
id: demo-wyo-classification
name: Wyoming ETS classification taxonomy
description: Use for Wyoming ETS document classification overview, counts by level or agency, pending review queue, and public-share spillage alerts. Do not use for SNAP or Medicaid fraud.
tool_ids:
  - wyo-classify-overview
  - wyo-classify-by-level
  - wyo-classify-pending-queue
  - wyo-classify-spillage
  - wyo-classify-spillage-alerts
---

# Wyoming ETS classification taxonomy

## When to use

Activate for classification snapshot, level breakdown (public/internal/confidential/restricted), pending review, agency counts, or restricted files in public share / spillage alerts.

## Data & tools

- Indexes: `wyo-classified-*`, `wyo-public-share`, `wyo-spillage-alerts`
- Also on agent: `wyo-classify-by-agency`, `platform.core.get_document_by_id`
- Optional: Cases tools if assigned for spillage escalation

## Steps

1. Prefer overview or the matching breakdown tool.
2. For spillage, run spillage + alerts tools and summarize file names carefully.
3. Do not invent classification levels or agency names.

## Do not use this skill for

- SNAP / Medicaid fraud
- Grants or athletics
