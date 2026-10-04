# Ghost Students Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a snapfraud-parity `ghoststudents` template branded as Northbridge Community College System, wired to `rrp_*` indices and Kibana space `ghost_students`.

**Architecture:** Clone the snapfraud pattern: template config + public sections + staff portal/panel + ES|QL helpers. Register in `templateEngine` and `App.jsx` agency overlay. Elastic IDs stay `rrp_*` / `ghost_students`; UI says Northbridge. Agent ID: `rrp-aid-integrity` (create on cluster later if missing).

**Tech Stack:** Vanilla JS + React 18, Vite 5, Tailwind CDN, existing `fetchESQLQuery` / ChatWidget / MentalHealthStaffChrome.

## Global Constraints

- Template ID: `ghoststudents`
- Public name: Northbridge Community College System
- Schema: `agency`
- Indices: `rrp_*` (no rename)
- Kibana space: `ghost_students` (dashboard hrefs must include `/s/ghost_students`)
- Colors: deep navy `#0B1F3A` + copper `#C45C26`
- Never declare a student fraudulent in UI copy
- No SNAP refactor

---

### Task 1: Template config + engine registration

**Files:**
- Create: `js/config/templates/ghoststudents.js`
- Modify: `js/config/templateEngine.js`

- [x] **Step 1:** Add `ghoststudents.js` with branding, five ring tiles, six sample prompts, `elastic.agentId: 'rrp-aid-integrity'`, dashboard IDs from live space, `kibanaSpace: 'ghost_students'`, indices map.
- [x] **Step 2:** Import and register in `templateEngine.js` templates map.
- [x] **Step 3:** Commit.

### Task 2: ES|QL helpers + UI utils

**Files:**
- Create: `js/modules/utils/ghostStudentsEsqlQueries.js`
- Create: `js/react/components/ghoststudents/ghostStudentsUi.js`
- Modify: `js/modules/utils/elasticApi.js` (add `rrp-aid-integrity` to GAWDZILLA sets)
- Modify: `js/modules/utils/agentChatStream.js` (rrp.* tool labels)

- [x] **Step 1:** Implement `getGhostOverviewStats`, `getGhostScoreTop`, `getSharedDevices`, `getSharedRefundAccounts` using Q7–Q10 / Q1 / Q3 shapes against `rrp_*`.
- [x] **Step 2:** Implement space-aware `kibanaDashboardHref` / Cases / Agent helpers.
- [x] **Step 3:** Commit.

### Task 3: Public sections + staff portal

**Files:**
- Create: `js/react/components/GhostStudentsPublicSections.jsx`
- Create: `js/react/components/GhostStudentsStaffPortal.jsx`
- Create: `js/react/components/ghoststudents/GhostStudentsPanel.jsx`
- Modify: `js/react/App.jsx`

- [x] **Step 1:** Public sections with ring tiles + KPI snapshot.
- [x] **Step 2:** Staff portal + panel with four KPIs, ghost-score table, shared infra, Kibana links.
- [x] **Step 3:** Wire `App.jsx` agency lists, staff branch, public sections.
- [x] **Step 4:** Commit.

### Task 4: Build and verify

- [x] **Step 1:** `docker compose up --build -d`
- [x] **Step 2:** Confirm `?template=ghoststudents` loads; staff portal renders; dashboard links include `/s/ghost_students`.
