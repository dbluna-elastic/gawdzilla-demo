---
id: demo-athletics-gameday-anomaly
name: Athletics gameday anomaly narrative
description: Use for gameday ticket and retail/POS anomaly storytelling — unusual purchases, resale, gate traffic, stand outages, and revenue summaries. Works for Texas College or Oklahoma State agents; prefer that agent's school-prefixed tools.
tool_ids:
  - platform.core.get_document_by_id
---

# Athletics gameday anomaly narrative

## When to use

Activate when the user asks about gameday revenue, unusual retail purchases, ticket resale, gate scans, concession stand performance, or a halftime/outage anomaly window.

## Data & tools

- Texas College agent tools: `gameday-revenue-summary`, `gameday-unusual-purchases`, `gameday-resale-activity`, `gameday-retail-*`, `gameday-ticket-*`
- Oklahoma State agent tools: `okstate-gameday-*` (POS stands, anomaly window, Paciolan tickets)
- Prefer the tools attached to the **current** agent — do not mix school indexes.

## Steps

1. Identify whether the agent is Texas College or OK State from available tools.
2. Run the matching summary or anomaly tool first.
3. Narrate findings with stand/gate/fan-tier context; do not invent SKUs or stand ids.
4. Suggest a follow-up (resale by tier, top stands, anomaly window detail) grounded in remaining tools.

## Do not use this skill for

- Donor stewardship / affinity (use donor skills)
- SNAP or Medicaid fraud
