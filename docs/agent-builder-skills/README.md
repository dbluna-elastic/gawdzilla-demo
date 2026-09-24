# Agent Builder skill library (gawdzilla)

Source-of-truth Markdown for reusable Elastic Agent Builder skills.
Re-apply to Kibana with `POST`/`PUT /api/agent_builder/skills`, then assign via agent `configuration.skill_ids`.

## Conventions

| Rule | Detail |
|------|--------|
| ID prefix | `demo-*` (keep legacy `okstate-giving-policies` as-is) |
| Skill-first | Create/update the skill before `PUT` on the agent |
| Tools | At most **5** `tool_ids` per skill (Kibana limit); list remaining tools on the agent and in the skill body |
| Description | Single-line YAML only (no `>` / `|` folded blocks in this repo’s sync script) |
| Portability | No hardcoded demo UI URLs; put index names and tool IDs under **Data & tools** |
| Sharing | Prefer one skill for multiple agents when the playbook is the same (e.g. gameday anomaly) |

## File template

Each file is named `<skill-id>.md` (e.g. `demo-fraud-investigation.md`).

```markdown
---
id: demo-example-skill
name: Human-readable name
description: When to activate (always in agent context). Keep under ~400 chars.
tool_ids:
  - some-esql-tool
  - platform.core.get_document_by_id
---

# Title

## When to use
...

## Data & tools
- Indexes: `index-pattern-*`
- Prefer tools: `tool-a`, `tool-b`

## Steps
1. ...

## Do not use this skill for
- ...
```

Front matter is used by `scripts/syncAgentBuilderSkill.py` to call the Kibana API. Body after front matter becomes skill `content`.

## Library map

| Skill ID | Agents | Phase |
|----------|--------|------:|
| `demo-fraud-investigation` | `ok-fraud` | 1 |
| `demo-grants-eligibility` | `ok-grants-data` | 2 |
| `demo-oja-supervision` | `ok-oja-data` | 3 |
| `demo-snap-trafficking` | `snap-fraud-investigator` | 4 |
| `demo-athletics-donor-stewardship-tx` | `booster-donor-data` | 5 |
| `demo-athletics-gameday-anomaly` | both gameday agents | 5–6 |
| `okstate-giving-policies` | `okstate-donor-assistant` | (existing) |
| `demo-oumet-delivery-rules` | OU Met catalog + provisioning | 7 |
| `demo-wyo-classification` | `wyo-classify` | 8 |

Also assign built-in `cases-management` on fraud agents (not stored here).
