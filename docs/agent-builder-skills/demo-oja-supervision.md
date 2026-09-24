---
id: demo-oja-supervision
name: OJA supervision playbook
description: Use for Oklahoma juvenile justice caseload stats, high-risk youth, recidivism, youth lookup, case notes, county caseload, and supervisor email drafts. Do not use for Medicaid fraud or grants.
tool_ids:
  - oja-youth-stats
  - oja-high-risk-youth
  - oja-youth-by-id
  - oja-case-notes-search
  - oja-supervisor-email-workflow
---

# OJA supervision playbook

## When to use

Activate for Office of Juvenile Affairs supervision questions: caseload stats, high-risk youth, recidivism, youth profile by id, concerning case notes, county breakdown, or drafting a supervisor email.

## Data & tools

- Indexes: `youth_profiles`, `case_notes`, `assessments`, `outcomes`
- Also on agent: `oja-recidivism-summary`, `oja-county-caseload`, `platform.core.get_document_by_id`

## Steps

1. Prefer the narrowest OJA ES|QL tool for the question.
2. Protect PII — summarize carefully; do not invent youth ids.
3. For supervisor outreach, call `oja-supervisor-email-workflow` with the youth id context.
4. If a tool returns empty, say so rather than guessing.

## Do not use this skill for

- SNAP or Medicaid fraud
- Grants or athletics demos
