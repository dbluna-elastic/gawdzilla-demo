# FW SCADA Water Demo Template — Design Spec

**Date:** 2026-10-12  
**Status:** Approved for implementation  
**Template ID:** `fwscada`  
**Reference Kibana dashboard:** `fw-facilities-incident` (space `fw-scada-water`)

## Goal

Add a dashboard-first executive template that recreates the City Utilities Facilities & Incident overview in the gawdzilla demo app: live site KPIs, process trends, alerts, facilities map/status, Kibana deep links, and floating Agent Builder chat.

## Decisions locked

| Decision | Choice |
|----------|--------|
| Entry | Dashboard-first (`?template=fwscada`); no public landing, no login |
| Branding | Generic **FW City Utilities** (no Fort Wayne / Fort Worth in UI copy) |
| UI approach | Native React + live ES|QL (not Kibana iframe) |
| Agent | `elastic-ai-agent` on gawdzilla |
| Schema | `agency` chrome, custom shell (not staff-portal tabs) |
| Implementation | Dedicated components (SNAP/Ghost-style panels; no shared refactor) |

## Identity & wiring

| Item | Value |
|------|--------|
| URL | `?template=fwscada` |
| Tagline | Operational awareness for water & wastewater SCADA |
| Kibana | `OK_KIBANA_URL` / space `fw-scada-water` |
| Agent | `elastic-ai-agent` (routed via gawdzilla proxy + `OK_KIBANA_API_KEY`) |
| Primary indices | `fw-site-status`, `metrics-fw_ot.process-*` |
| Colors | Utility teal primary + amber warning + red alarm |

## Surfaces

1. Thin header — wordmark, system status pill, refresh, Kibana links  
2. KPI strip — Total / Normal / Alarm / Warning / Comm Health / System Status  
3. Process trends — wet-well (Anthony Blvd LS), chlorine residual & filtered turbidity (Three Rivers)  
4. Alerts — severity summary + active alert list  
5. Facilities — compact geo scatter + status by type + distribution  
6. Sites table — red/amber first with reason and alert counts  
7. Kibana deep links — Facilities & Incident, Executive Dashboard, SCADA overview + secondary chips  
8. Floating `ChatWidget` with SCADA sample prompts  

## Architecture

```
js/config/templates/fwscada.js
js/config/templateEngine.js
js/react/App.jsx                          # early return for fwscada
js/react/components/fwscada/FwScadaExecutiveDashboard.jsx
js/react/components/fwscada/fwScadaUi.js
js/modules/utils/fwScadaEsqlQueries.js
js/modules/utils/elasticApi.js           # gawdzilla agent/ES allowlist
nginx.conf / vite.config.js              # elastic-ai-agent → OK_KIBANA
public/logo-fwscada.svg
```

## Out of scope (v1)

- Staff login / citizen landing  
- Dedicated FW ops agent (use Elastic AI Agent)  
- Full Leaflet basemap (use compact geo plot from site coordinates)  
- Security attack-timeline deep dive beyond alert/status signals already in site status  
