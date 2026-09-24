---
id: demo-fraud-investigation
name: OK Medicaid fraud investigation
description: Use for Oklahoma Medicaid / phantom-billing fraud metrics, high-risk claims, loss by flag type, investigation resolution, and opening Cases from fraud findings. Do not use for SNAP EBT trafficking or grant eligibility.
tool_ids:
  - ok-fraud-ytd-loss
  - ok-fraud-high-priority
  - ok-fraud-loss-by-flag
  - platform.core.cases.manage
  - platform.core.get_document_by_id
---

# OK Medicaid fraud investigation

## When to use

Activate when the user asks about Medicaid fraud exposure, YTD loss, flagged or high-risk claims, loss by flag type, investigation assignment rate, high-priority cases, crisis call-center stats tied to the OK mental-health demo, clinical relapse rates, or opening an investigation Case.

## Data & tools

- Indexes: `ok-fraud-phantom-billing`, `ok-fraud-*`, crisis/clinical indices used by the named tools
- Prefer dedicated agent tools: `ok-fraud-ytd-loss`, `ok-fraud-flagged-claims`, `ok-fraud-high-risk`, `ok-fraud-loss-by-flag`, `ok-fraud-resolution-rate`, `ok-fraud-high-priority`, `ok-crisis-stats`, `ok-clinical-relapse`
- Cases: `platform.core.cases` / `platform.core.cases.manage` (and built-in `cases-management` skill)

## Steps

1. Match the question to the narrowest tool (YTD loss, flagged count, high-risk count, loss by flag, resolution rate, high-priority list).
2. Run the tool; summarize numbers clearly with currency/percent formatting.
3. For a specific recipient or claim follow-up, use `platform.core.get_document_by_id` or `platform.core.search` on `ok-fraud-*` when needed.
4. When the user asks to open or update an investigation Case, use Cases tools — include recipient ID, flag type, loss, and priority in the case description. Confirm before destructive updates.
5. Never invent claim IDs or loss amounts; if a tool returns empty, say the index had no matching rows.

## Do not use this skill for

- SNAP EBT trafficking patterns (use SNAP fraud tools/skill)
- Oklahoma grant search or program-officer email
- Athletic donor or gameday revenue questions
