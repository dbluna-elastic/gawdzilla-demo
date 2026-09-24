---
id: demo-oumet-delivery-rules
name: OU Met data delivery rules
description: Use for OU meteorology catalog search, delivery mode classification (direct vs provision/mount), provision status, and ops queue. Shared by catalog and provisioning agents.
tool_ids:
  - ou-met-search-by-tier
  - ou-met-resolve-catalog-file
  - ou-met-check-provision-status
  - ou-met-list-provision-queue
  - ou-met-submit-provision-request
---

# OU Met data delivery rules

## When to use

Activate for catalog discovery (tier, variable, date), deciding whether a dataset is direct-download vs VM mount, checking provision status, listing the ops queue, or submitting a provision request.

## Data & tools

- Indexes: `ou-met-catalog`, `provisioning-requests`
- Catalog agent also has search/list tools + platform core
- Provisioning agent focuses on resolve/status/queue (+ workflow status tools when attached)

## Steps

1. Resolve the catalog file before recommending a delivery mode.
2. If delivery requires mounting, use `ou-met-submit-provision-request` only with required fields from the tool description — do not invent request ids casually.
3. Ops questions → `ou-met-list-provision-queue` / `ou-met-check-provision-status`.
4. Prefer tools over guessing access URLs.

## Do not use this skill for

- Athletics, grants, SNAP, or Wyoming classification demos
