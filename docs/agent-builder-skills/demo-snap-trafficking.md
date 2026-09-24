---
id: demo-snap-trafficking
name: SNAP trafficking investigation
description: Use for SNAP EBT trafficking signals (same-cent stores, rapid baskets, balance drains, manual entry, large baskets, cross-state identities, deceased accounts) and opening Cases or trafficking workflows. Do not use for Medicaid phantom billing.
tool_ids:
  - snap.fraud.find_same_cent_stores
  - snap.fraud.find_rapid_transactions
  - snap.fraud.find_balance_drains
  - snap-trafficking-case-workflow
  - platform.core.cases.manage
---

# SNAP trafficking investigation

## When to use

Activate for SNAP fraud investigation prompts about suspicious stores, broken-up baskets, drains, manual EBT entry, large convenience baskets, cross-state identities, deceased-account activity, nightly sweep status, or opening a trafficking case.

## Data & tools

- Indexes: `snap-transactions`, `snap-stores`, `snap-households`, `snap-reference`
- Detection tools on agent: `snap.fraud.find_*` suite + `platform.core.search`
- Workflows: `snap-trafficking-case-workflow`, `snap-nightly-fraud-sweep-workflow` (when attached)
- Cases: assign built-in `cases-management` on the agent

## Steps

1. Pick the detection tool that matches the pattern described.
2. Summarize store/household ids and counts from tool output.
3. When asked to open a case, prefer the trafficking workflow tool and/or Cases tools; confirm before writes.
4. For nightly sweep status, use workflow execution status tools if available.

## Do not use this skill for

- Oklahoma Medicaid phantom-billing (`ok-fraud`)
- Grants or athletics
