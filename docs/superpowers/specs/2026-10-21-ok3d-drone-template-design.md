# OK 3D Drone Template — Design Spec

**Date:** 2026-10-21  
**Status:** Approved for implementation  
**Template ID:** `ok3d`  
**Kibana space:** `ok3d-uas`  
**Reference URL:** https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com/s/ok3d-uas

## Goal

Add an oumet-style public landing + demo login template for Oklahoma 3D Mesonet UAS ops. After login, a single tabbed portal shows live drone stats beside a drone image, a flight-area map, and ES|QL-backed Flights / Airspace / Delivery views, with floating Mesonet Flight Analyst chat.

## Decisions locked

| Decision | Choice |
|----------|--------|
| Branding | **OK 3D Drone** (Oklahoma 3D Mesonet UAS) |
| Entry | School landing + LoginModal (oumet pattern); no dual researcher/ops split |
| Portal | One login → tabs: Overview / Flights / Airspace / Delivery |
| UI data | Native React + live ES|QL (not Kibana iframes) |
| Agent | `mesonet-flight-analyst` (space `ok3d-uas`) |
| Sites | `kaefs` (Kessler), `bixby` |

## Identity & wiring

| Item | Value |
|------|--------|
| URL | `?template=ok3d` |
| Schema | `school` |
| Kibana | `OK_KIBANA_URL` / space `ok3d-uas` |
| Agent | `mesonet-flight-analyst` |
| Primary indices | `uas-flights`, `uas-telemetry`, `uas-boundaries`, `remoteid-detections`, `adsb-traffic` |
| Demo login | password `test` or `staff` → OK 3D ops portal |

## Surfaces

### Public (pre-login)

- Hero (OK 3D / UAS weather observing)
- Promo bar (synthetic demo data disclaimer)
- News tiles for ops, science, airspace, NWS delivery
- CTA opens LoginModal; floating chat optional on landing with sample prompts

### Authenticated portal

1. **Overview** — drone photo + live KPI cards; site switcher; Leaflet map of `uas-boundaries` locations
2. **Flights** — recent `uas-flights` table
3. **Airspace** — Remote ID detections (+ ADS-B summary when available)
4. **Delivery** — 7-day NWS delivery SLA by site
5. Floating `ChatWidget` (`mesonet-flight-analyst`) on all tabs

## Architecture

```
js/config/templates/ok3d.js
js/config/templateEngine.js
js/react/App.jsx
js/react/components/ok3d/*
js/modules/utils/ok3dEsqlQueries.js
js/modules/utils/elasticApi.js          # allowlist mesonet-flight-analyst
js/modules/utils/agentChatStream.js     # tool step labels
nginx.conf / vite.config.js             # space-scoped agent proxy → /s/ok3d-uas/...
public/logo-ok3d.svg
```

## Out of scope (v1)

- Dual researcher vs ops logins
- Agent Builder skill sync / new tools
- Live video / full track replay
- Dedicated Agent Builder skill markdown beyond existing tools

## Test gate

- [ ] `?template=ok3d` shows OK 3D landing
- [ ] Login (`staff` or `test`) opens tabbed portal
- [ ] Overview shows stats + map for kaefs/bixby
- [ ] Flights / Airspace / Delivery return rows
- [ ] Chat sample prompts reach `mesonet-flight-analyst` via space proxy
