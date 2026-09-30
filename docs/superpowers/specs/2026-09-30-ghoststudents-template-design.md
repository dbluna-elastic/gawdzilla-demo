# Ghost Students Demo Template — Design Spec

**Date:** 2026-09-30  
**Status:** Approved for planning  
**Template ID:** `ghoststudents`  
**Companion:** `ghost_students_demo_build_plan.md` (Elastic cluster build plan)  
**Related cluster work:** Kibana space `ghost_students`, indices `rrp_*`, Aid Integrity Agent

## Goal

Add a snapfraud-parity investigator portal template to the gawdzilla demo app for the Title IV “ghost student” fraud story. Public branding is **Northbridge Community College System**. Elastic IDs stay as built (`rrp_*`, space `ghost_students`); only the app UI is rebranded.

## Decisions locked

| Decision | Choice |
|----------|--------|
| Portal depth | Snapfraud-parity (landing tiles, staff login, live KPIs, agent chat, Kibana deep links) |
| Implementation approach | Clone snapfraud pattern (dedicated components; no SNAP refactor) |
| Public institution name | Northbridge Community College System |
| Under-the-hood IDs | Keep `ghost_students` / `rrp_*` / existing Aid Integrity agent |
| Schema / layout | `agency` overlay (same family as snapfraud, okoja, wyoming) |

## Identity & wiring

| Item | Value |
|------|--------|
| URL switch | `?template=ghoststudents` |
| Tagline | Aid integrity for Title IV — catch ghost enrollments before clawback |
| Staff role label | Aid Integrity Investigator |
| Colors | Deep navy primary + copper accent (distinct from SNAP green / OK crimson) |
| Logo | Reuse a clean existing SVG or simple wordmark placeholder until a dedicated asset exists |
| Kibana | `OK_KIBANA_URL` / space `ghost_students` |
| Agent | Live Aid Integrity agent ID — discover exact ID from Kibana Agent Builder at implement time, then set `elastic.agentId` and add to `elasticApi.js` allowlists |
| Dashboard links (space `ghost_students`) | `rrp-aid-integrity` (Fall 2026 Aid Integrity), `rrp-ring-map`, `rrp-investigator`, `rrp-section-integrity`, Next Wave Watch (`rrp-next-wave` or confirm ID at implement) |

## Surfaces

### Public landing

- Agency overlay hero for Northbridge Aid Integrity
- Five story tiles: Tumbleweed, Harbor, Borrowed Names, Slow Burn, Next Wave (Northbridge copy; same narrative as the build plan)
- Promo bar: synthetic demo data notice
- Primary CTA: Staff Login → investigator portal

### Staff portal

- `GhostStudentsStaffPortal` using shared staff chrome (MentalHealthStaffChrome pattern, same as SNAP)
- Single tab: Aid Integrity
- Floating `ChatWidget` bound to Aid Integrity Agent
- Sample prompts: the six scripted prompts from the build plan:
  1. Students with released aid but almost no academic activity
  2. Everything tied to the device used by the top result
  3. Fall aid at risk of return, by campus
  4. Real students waitlisted out of high-risk-filled sections
  5. Draft OIG referral summary for the Tumbleweed cluster
  6. Help desk requests that look like account takeover for flagged students

### Intelligence panel (live ES|QL)

KPI strip:

1. Released aid at risk (clawback exposure)
2. High-risk / ghost-flagged students
3. Ghost seats displacing real students
4. Help-desk Next Wave tickets (recent window)

Supporting tables/cards:

- Top ghost-score students
- Shared-device / shared-refund highlights
- Deep-link buttons to the five Kibana dashboards (plus Agent Builder / Cases when IDs exist)

Query shapes follow build-plan Q7–Q10 (and Q1/Q3 variants for shared infrastructure). Implementation lives in `js/modules/utils/ghostStudentsEsqlQueries.js`.

## Architecture

```
js/config/templates/ghoststudents.js
js/config/templateEngine.js          # register template
js/react/App.jsx                     # agency overlay + staff portal branch
js/react/components/
  GhostStudentsPublicSections.jsx
  GhostStudentsStaffPortal.jsx
  ghoststudents/
    GhostStudentsPanel.jsx
    ghostStudentsUi.js
js/modules/utils/
  ghostStudentsEsqlQueries.js
  agentChatStream.js                 # rrp.* tool labels when IDs confirmed
  elasticApi.js                      # Agent Builder allowlist
```

Data flow:

1. Template engine selects `ghoststudents` via URL / env / subdomain.
2. Public sections render Northbridge copy from template config.
3. Staff login routes to `GhostStudentsStaffPortal`.
4. Panel loads KPIs via ES|QL against `rrp_*` using existing Kibana API key pattern (`OK_KIBANA_*`).
5. Chat uses Agent Builder for the Aid Integrity agent; optional fast path is a follow-up, not required for v1.

## Error handling

- KPI failures: banner with actionable message (indices missing, API key, space), same pattern as SNAP.
- Chat failures: stay inside ChatWidget.
- UI copy describes indicators and review workflows; never declares a student fraudulent.

## Testing gate

- [ ] `?template=ghoststudents` loads Northbridge landing with five ring tiles
- [ ] Staff login opens Aid Integrity portal
- [ ] Four KPIs populate, or show honest empty/error state
- [ ] Dashboard links open the five boards in space `ghost_students`
- [ ] Chat answers at least 3 of 6 scripted prompts with record citations

## Out of scope

- Renaming `rrp_*` indices or the Kibana space
- FERPA role switching inside the demo app (Kibana-side only)
- ML Anomaly Explorer / Attack Discovery UI in the app
- Synthetic data generator / cluster rebuild
- Refactoring snapfraud into a shared shell
- Agent skill sync / cluster Agent Builder level-set beyond wiring the existing agent ID and stream labels

## Success criteria

A presenter can run Acts 1–2 of the ghost students run-of-show from `http://localhost:8089?template=ghoststudents`: public story, staff KPIs, Kibana deep links, and Aid Integrity Agent chat — with Northbridge branding and unchanged Elastic IDs.
