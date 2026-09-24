# Gawdzilla Agent Builder Audit — Elastic / Kibana 9.5.3

**Deployment:** `gawdzilla-0d3e9e` (us-east-2)  
**Stack version:** Kibana **9.5.3** (build `2169f1de4c91`)  
**Audit date:** 2026-09-23  
**Source of truth:** Live `GET /api/agent_builder/{agents,tools,skills,plugins}` + `/api/workflows` + demo app templates (`js/config/templates/*`, `elasticApi.js`, chat fast paths)

This log captures what each Agent Builder agent has today (tools, skills, workflows), how the demo app uses it, and what is underused or missing relative to Agent Builder capabilities shipping in **9.5.3**.

---

## Executive summary

| Area | Status on gawdzilla |
|------|---------------------|
| Custom ES\|QL / index_search tools | Strong for athletics, SNAP, OJA, OU Met, Wyoming; weak for **ok-fraud** and **ok-grants-data** (mostly `platform.core.*`) |
| Workflow tools on agents | Partial — email / provision workflows attached on some agents; SNAP case workflows exist but are **not** agent tools |
| Custom **skills** | **Library in place** — `demo-*` skills assigned per vertical (+ shared gameday / OU Met); source in `docs/agent-builder-skills/` |
| Built-in skills (42 available) | Present; **`cases-management`** assigned on fraud / SNAP / Wyoming |
| Plugins | **0** installed |
| MCP / connectors / Cases / viz / A2A | Available in platform tooling; **not leveraged** by demo agents |
| Demo app pattern | Heavy **chat fast path** (direct ES\|QL) that bypasses Agent Builder for common prompts |

**Gold standard on this cluster:** `okstate-donor-assistant` — curated ES\|QL + `index_search` + workflow tool + custom skill. Most other demo agents should be brought up to that bar.

---

## What’s new / underused in Agent Builder @ 9.5.3

Capabilities confirmed live or in current Elastic docs that demo agents largely skip:

| Capability | Live on gawdzilla? | Used by demo agents? | Opportunity |
|------------|--------------------|----------------------|-------------|
| **Skills** (`/api/agent_builder/skills`) | Yes — 42 skills (1 custom) | Only OK State donor | Domain skills for fraud, grants, SNAP, OJA, classification |
| **`enable_elastic_capabilities`** | Yes on `elastic-ai-agent` | Not on custom demos | Optional for ops/search agents; keep demos scoped |
| **Cases tools + `cases-management` skill** | Built-in tools present | No | SNAP / Medicaid fraud → open Cases from chat |
| **Workflow authoring / execute / resume** | Built-in tools present | Only thin `type: workflow` wrappers | Attach workflows as tools; fix tool_params; use `ai.agent` steps |
| **MCP tools / plugins** | Plugins API empty | No | Package reusable demo skill packs |
| **Connectors** (`execute_connector_sub_action`) | Built-in | No | Email / ticketing without custom workflow only |
| **Attachments / conversation APIs** | Available | App uses converse/async only | Evidence packs, policy PDFs, case attachments |
| **Access control per agent** | Most `public` | No fine-grained demo | Manager/reader roles for staff portals |
| **Traces / token consumption** | Skills + APIs exist | Not in app | Demo “cost of this chat” or ops dashboard |
| **Visualization / dashboard skills** | Built-in | No | “Build a panel from this query” in athletics / fraud |

App workaround still documented in code (`workflowRunApi.js`): Agent Builder **workflow tools drop `tool_params`** when created via API, so the UI calls Workflows `/run` directly. Re-test on 9.5.3; if fixed, prefer agent-attached workflow tools again.

---

## Inventory snapshot

| Resource | Count |
|----------|------:|
| Agents | 22 |
| Tools (builtin + custom) | 171 |
| Skills | 42 (1 user: `okstate-giving-policies`) |
| Plugins | 0 |
| Workflows | 22 |

### Demo-relevant agents (wired in this repo)

From `GAWDZILLA_AGENT_BUILDER_IDS` + templates:

| Agent ID | Template / surface | Fast path? |
|----------|--------------------|------------|
| `ok-fraud` | okmentalhealth (fraud chat) | Yes |
| `ok-grants-data` | okagency, okmentalhealth | Yes |
| `ok-oja-data` | okoja | Yes |
| `booster-donor-data` | texascollege | Yes |
| `gameday-revenue-data` | texascollege gameday | Yes |
| `okstate-donor-assistant` | okstate | Yes |
| `okstate-gameday-revenue-assistant` | okstate gameday | Yes |
| `ou-met-catalog-agent` | oumet researcher | Yes |
| `ou-met-provisioning-agent` | oumet staff | Yes |
| `snap-fraud-investigator` | snapfraud | Yes |
| `wyo-classify` | wyoming | Yes |

Also on cluster (scholarship / other, not the main gawdzilla demo set): `studentcounselor`, `scholarship-counselor-default`, `texas|oklahoma|beauregard-scholarship-counselor`, `dot-transportation-assistant`, `marketing-play-strategist`, `papertrail`, platform streams agents, `elastic-ai-agent`.

---

## Per-agent detail

Legend for **Maturity**:  
- **Full** — scoped tools + (skill and/or workflow) aligned with demo  
- **Partial** — useful tools but gaps vs app or 9.5.3 features  
- **Thin** — mostly `platform.core.*`; app compensates with fast path  

---

### 1. `ok-fraud` — Medicaid fraud — **Thin**

**In place**
- Tools: `platform.core.search`, `list_indices`, `get_index_mapping`, `get_document_by_id`, `get_workflow_execution_status`
- Instructions: Medicaid Recipient ID / `ok-fraud-*` search guidance (~1.6k chars)
- App: dashboard ES\|QL + `fraudChatFastPath`; ChatWidget agent override `ok-fraud`
- Labels: `ok-fraud`
- Skills: none  
- Workflows: none attached

**Gaps / updates**
- UI labels in `agentChatStream.js` reference tools that **do not exist** as Agent Builder tools (`ok-fraud-ytd-loss`, `ok-fraud-high-risk`, etc.). Those metrics live only in app ES\|QL helpers.
- Promote fast-path queries into **typed `esql` tools** and attach them to the agent (match booster/OJA pattern).
- Add skill e.g. `ok-medicaid-fraud-investigation` (playbook + index map + how to escalate).
- Assign **`cases-management`** (or custom skill wrapping Cases) for “open investigation case from this claim.”
- Consider `platform.core.execute_esql` / `generate_esql` for ad-hoc analyst questions beyond canned tools.
- Workflow: alert → summarize → case (Security workflows exist on cluster but aren’t wired to this agent).

---

### 2. `ok-grants-data` (Carey Grant Bot) — **Partial**

**In place**
- Tools: `platform.core.search`, `list_indices`, `get_index_mapping`, `get_document_by_id`, `get_workflow_execution_status`, **`ok-grants-program-email-workflow`**
- Strong instructions (~4.7k) for OK business grants
- Workflow: `ok-grant-program-officer-email` (enabled); template `toolId` matches
- App: `grantsChatFastPath` + index `_search` via `ok-fraud` ES proxy

**Gaps / updates**
- Stream labels mention `ok-grants-portfolio-stats`, `ok-grants-search`, `ok-grants-by-status`, etc. — **not registered** as Agent Builder tools. Create ES\|QL / `index_search` tools on `ok-grant-data` and attach them.
- Skill: grant-eligibility rules, agency glossary, deadline etiquette (like OK State giving skill).
- Re-test workflow tool params on 9.5.3; keep `/run` fallback until confirmed.
- Optional: `index_search` over grant narratives for semantic match (mirror `okstate-athletic-boosters-search`).

---

### 3. `ok-oja-data` — OJA Juvenile Justice — **Partial → near Full on tools**

**In place**
- Tools: `oja-youth-stats`, `oja-high-risk-youth`, `oja-recidivism-summary`, `oja-youth-by-id`, `oja-case-notes-search`, `oja-county-caseload`, `platform.core.get_document_by_id`
- Workflow exists: `oja-supervisor-email-draft` + tool `oja-supervisor-email-workflow`
- App: OJA fast path; email button uses Workflows `/run` directly

**Gaps / updates**
- **Attach `oja-supervisor-email-workflow` to the agent** (tool exists, agent toolset omits it).
- Skill: supervision policy / PII redaction / when to escalate to supervisor.
- Cases skill for youth-risk escalation demos.
- Add `platform.core.search` if officers need free-text over case notes beyond the fixed ES\|QL tool.

---

### 4. `snap-fraud-investigator` — **Partial (strong tools, weak workflow/skill)**

**In place**
- Detection ES\|QL tools: same-cent, rapid txns, balance drains, manual entry, large baskets, cross-state identities, deceased txns + `platform.core.search` / `get_document_by_id`
- Template workflows: `snap-trafficking-case`, `snap-nightly-fraud-sweep`
- Cluster also has: `snap-large-basket-case`, `snap-cross-state-case`, `snap-deceased-case`, `snap-rapid-basket-case`, `snap-manual-entry-case`, `snap-drain-case` (all enabled)

**Gaps / updates**
- **No workflow tools on the agent** — case workflows are orphaned from chat. Add `type: workflow` tools (or one parameterized “open SNAP case” workflow) and attach them.
- Nightly sweep is automation — wire as scheduled workflow + optional agent status tool (`get_workflow_execution_status` already useful).
- Skill: SNAP trafficking typology + which tool to pick + when to open a case.
- Assign **`cases-management`** for investigator handoff.
- Fix app label drift: stream map uses `snap.fraud.find_large_baskets` / `find_cross_state_ids`; live IDs are `find_large_baskets_small_stores` / `find_cross_state_identities`.

---

### 5. `booster-donor-data` — Texas College donors — **Full (tools/workflow); skills missing**

**In place**
- ES\|QL: portfolio stats, at-risk, major gifts, affinity, by-id, engagement summary, case metrics
- Workflow tool: `booster-alumni-email-workflow` → `texas-college-alumni-outreach-email`
- App fast path mirrors tools; email via `/run`

**Gaps / updates**
- Add a **giving / stewardship skill** (clone pattern from `okstate-giving-policies`) if policy docs exist for Texas College.
- Optional `index_search` over donor bios (OK State already has this).
- Visualization skill for “chart affinity by class year” style demos.

---

### 6. `gameday-revenue-data` — Texas College gameday — **Full (tools); skills/workflows missing**

**In place**
- Rich retail + ticket ES\|QL set (summary, catalog, category, SKU, gates, resale, anomalies, etc.)
- No custom skill; no workflow tool

**Gaps / updates**
- Skill: how to narrate anomalies / resale / retail vs concessions (demo script as skill content).
- Workflow: “gameday anomaly brief → email ops” or Cases for security anomalies.
- Note: older POS-named tools (`gameday-pos-*`) still exist on the cluster but are **not** on this agent (agent uses retail-catalog model — OK if intentional; otherwise clean up dead tools).

---

### 7. `okstate-donor-assistant` — **Full (reference implementation)**

**In place**
- Prefixed ES\|QL tools + `okstate-athletic-boosters-search` (`index_search`) + `okstate-giving-policy-search`
- Skill: **`okstate-giving-policies`** (`skill_ids`)
- Workflow: `okstate-alumni-email-workflow` → `oklahoma-state-alumni-outreach-email`
- Labels: booster / donors / athletics / oklahoma-state
- Clear instructions scoping away Texas College indexes

**Gaps / updates**
- Still uses app `/run` for email — retest native workflow tool params.
- Could add `cases-management` for advancement “at-risk major gift” cases.
- Model for all other verticals.

---

### 8. `okstate-gameday-revenue-assistant` — **Full (tools); skills/workflows missing**

**In place**
- Full Boone Pickens POS + Paciolan toolset (stands, zones, anomaly window, gates, resale, etc.)

**Gaps / updates**
- Skill: Club Orange outage story + how to use anomaly window tool.
- Workflow: notify ops / open case on anomaly window detection.
- Mirror Texas gameday if you want cross-school comparison skill.

---

### 9. `ou-met-catalog-agent` — **Full**

**In place**
- Catalog search tools + provision status/queue + **`ou-met-submit-provision-request`** (workflow) + core search/mapping/list
- Workflow: `ou-met-submit-provision-request` enabled

**Gaps / updates**
- Skill: delivery_mode rules (when to auto-mount vs approve) as referenced content.
- Attachments: sample NetCDF / catalog metadata in chat (9.5.3 conversation attachments).

---

### 10. `ou-met-provisioning-agent` — **Partial (intentionally narrow)**

**In place**
- Tools: resolve catalog file, check status, list queue only (ops-focused)

**Gaps / updates**
- Add `platform.core.get_workflow_execution_status` / `list_workflow_executions` / `resume_workflow_execution` for HITL mounts.
- Skill: ops runbook for Sean/Corey approvals.
- Consider Cases for failed provisions.

---

### 11. `wyo-classify` — Wyoming ETS classification — **Partial → strong tools**

**In place**
- ES\|QL: overview, by level, pending queue, by agency, spillage, spillage alerts + `get_document_by_id`
- No workflows / skills in template

**Gaps / updates**
- Skill: classification taxonomy + spillage response playbook.
- Workflow: “restricted in public_share → alert + case.”
- Cases + optional Security skills if demo ties into Elastic Security later.

---

### Built-in / other agents (brief)

| Agent | Notes |
|-------|--------|
| `elastic-ai-agent` | `enable_elastic_capabilities: true`, empty `skill_ids`/`tools` — platform default; good for exploring built-in skills, not a branded demo |
| Scholarship counselors + `studentcounselor` | Shared `scholarship_index` / policy tools; thin vs athletics agents; candidates for a shared **scholarship skill** |
| `dot-transportation-assistant` | Single ES\|QL + shared scholarship tools — odd mix; tighten toolset |
| `marketing-play-strategist` | Solid ES\|QL set; workflow `marketing-email-hitl` exists but not attached |
| Streams / Security sample workflows | Present on cluster; not part of gawdzilla demo templates |

---

## Workflows vs agents (demo)

| Workflow ID | Enabled | Agent-attached tool? | App usage |
|-------------|---------|----------------------|-----------|
| `texas-college-alumni-outreach-email` | Yes | `booster-alumni-email-workflow` on `booster-donor-data` | `/run` from UI |
| `oklahoma-state-alumni-outreach-email` | Yes | `okstate-alumni-email-workflow` | `/run` from UI |
| `ok-grant-program-officer-email` | Yes | `ok-grants-program-email-workflow` | Template + `/run` path |
| `oja-supervisor-email-draft` | Yes | Tool exists; **not on agent** | `/run` from UI |
| `ou-met-submit-provision-request` | Yes | On catalog agent | Chat + template |
| `snap-trafficking-case` | Yes | **No** | Template only |
| `snap-nightly-fraud-sweep` | Yes | **No** | Template only |
| Other `snap-*-case` | Yes | **No** | Unused by app |
| `marketing-email-hitl` | Yes | **No** | Unused by main templates |

---

## Skills matrix (demo agents)

| Agent | Custom skill | Built-in skills assigned |
|-------|--------------|--------------------------|
| `okstate-donor-assistant` | `okstate-giving-policies` | — |
| All other demo agents | — | — |
| `elastic-ai-agent` | — | Via `enable_elastic_capabilities` |

**Highest-ROI custom skills to add (9.5.3 pattern):**

1. `ok-medicaid-fraud-playbook` → `ok-fraud`  
2. `ok-grants-eligibility` → `ok-grants-data`  
3. `snap-trafficking-playbook` → `snap-fraud-investigator`  
4. `oja-supervision-playbook` → `ok-oja-data`  
5. `wyo-classification-taxonomy` → `wyo-classify`  
6. `ou-met-delivery-rules` → catalog / provisioning agents  
7. `gameday-anomaly-narrative` → both gameday agents  

Reuse built-ins where relevant: `cases-management`, `workflow-authoring`, `visualization-creation`, `discover-data-analysis`.

---

## App / platform gaps (not just agent config)

1. **Dual truth:** Chat fast path answers many questions without Agent Builder — great for demos, but agents look “empty” in Kibana and don’t exercise skills/tools.
2. **Tool ID drift** in `agentChatStream.js` (SNAP names; phantom `ok-fraud-*` / `ok-grants-*` labels).
3. **Workflow tool_params workaround** — validate on 9.5.3 and document result here when known.
4. **No plugins** — consider packaging vertical skill+tool sets as Agent Builder plugins for portability.
5. **No MCP exposure** of these agents to external hosts (Cursor/Claude) despite 9.5.3 programmatic access (MCP / A2A / REST).
6. **Observability of agents:** traces dashboard / consumption API unused in the demo UI.
7. Scholarship agents on same cluster compete for attention; keep or isolate in a space if demos collide.

---

## Recommended upgrade order

1. **Parity:** Create missing ES\|QL tools for `ok-fraud` and `ok-grants-data`; attach OJA email workflow to `ok-oja-data`.  
2. **Skills:** One custom skill per vertical (start with fraud + SNAP + grants).  
3. **Workflows:** Attach SNAP case workflows as agent tools; wire marketing HITL if that demo returns.  
4. **Cases:** Enable Cases tools/skill on fraud investigators.  
5. **Platform:** Retest workflow `tool_params`; optionally add plugins pack; fix stream labels.  
6. **Showcase 9.5.3:** One agent with attachments + token/traces panel + MCP card for “full platform” story.

---

## Appendix — Live custom tools by family (non-exhaustive)

- **Booster / Texas:** `booster-*`, `gameday-retail-*`, `gameday-ticket-*`, …  
- **OK State:** `okstate-booster-*`, `okstate-gameday-*`, `okstate-athletic-boosters-search`, `okstate-giving-policy-search`  
- **OJA:** `oja-*`  
- **OU Met:** `ou-met-*`  
- **SNAP:** `snap.fraud.find_*`  
- **Wyoming:** `wyo-classify-*`  
- **Grants / fraud:** mostly platform core only (gap)  
- **Workflow-type tools:** `booster-alumni-email-workflow`, `okstate-alumni-email-workflow`, `ok-grants-program-email-workflow`, `oja-supervisor-email-workflow`, `ou-met-submit-provision-request`

---

## Change log

| Date | Note |
|------|------|
| 2026-09-23 | Initial audit against live gawdzilla Kibana **9.5.3** |
| 2026-09-23 | **Phase 0–1:** `AGENT_FAST_PATH_SKIP`; skill library (`demo-*` hyphen IDs, max 5 tools/skill); Cursor skill `gawdzilla-agent-builder-levelset`. `ok-fraud` ES\|QL tools + `demo-fraud-investigation` + `cases-management`. Converse YTD loss OK. |
| 2026-09-23 | **Phases 2–9:** Leveled all demo agents with skills/tools/workflows. Skills: `demo-grants-eligibility`, `demo-oja-supervision`, `demo-snap-trafficking`, `demo-athletics-donor-stewardship-tx`, `demo-athletics-gameday-anomaly` (shared), `demo-oumet-delivery-rules` (shared), `demo-wyo-classification`. SNAP workflow tools attached. App SNAP labels + template toolIds fixed. Converse smoke tests passed for grants/oja/snap/booster/gameday/okstate-gameday/ou-met/wyo. Workflow `okstate-alumni-email-workflow` `_execute` with `donor_id` completed successfully on 9.5.3 (re-test `/run` fallback only if chat drops params). Plugins/MCP still deferred. |

*Re-run discovery with:*  
`GET /api/agent_builder/agents` · `tools` · `skills` · `plugins` · `GET /api/workflows`
