---
id: demo-ghost-aid-integrity
name: Ghost student aid integrity
description: Use for Title IV ghost-student fraud investigation — ghost scores, student timelines, shared devices/refunds, clawback exposure, displaced students, and help desk takeover signals on rrp_* indices. Do not use for SNAP or Medicaid fraud.
tool_ids:
  - rrp.ghost_score_top
  - rrp.student_timeline
  - rrp.shared_infrastructure
  - rrp.clawback_exposure
  - rrp.displaced_students
---

# Ghost student aid integrity

## When to use

Activate for Northbridge / RRP aid integrity questions: students with released aid and little academic activity, ghost scores, shared device fingerprints or refund destinations, Fall clawback exposure by campus, real students waitlisted behind high-risk enrollments, help desk account-access campaigns, or drafting an OIG referral summary with record citations.

## Data & tools

- Indexes: `rrp_applications`, `rrp_isir`, `rrp_enrollment`, `rrp_disbursements`, `rrp_lms_activity`, `rrp_auth_logs`, `rrp_helpdesk`, `rrp_student_flags_lookup`, `rrp_identity_risk_lookup`
- Prefer dedicated tools: `rrp.ghost_score_top`, `rrp.student_timeline`, `rrp.shared_infrastructure`, `rrp.clawback_exposure`, `rrp.displaced_students`, `rrp.helpdesk_search`
- Cases: use built-in `cases-management` / `platform.core.cases*` when asked to open an investigation packet

## Steps

1. Match the question to the narrowest tool (ghost score list, timeline by student.id, shared devices, clawback, displaced seats, help desk).
2. Always cite student IDs, device fingerprints, refund hashes, campus IDs, and dollar amounts from tool output.
3. Describe **indicators** only — never declare a student fraudulent. Recommend identity confirmation outreach for flagged enrolled students.
4. When drafting an OIG referral, build a timeline from `rrp.student_timeline` and cluster evidence from shared infrastructure tools; include record citations.
5. If a tool returns empty, say the index had no matching rows — do not invent IDs or amounts.

## Do not use this skill for

- SNAP EBT trafficking (`snap-fraud-investigator`)
- Oklahoma Medicaid phantom billing (`ok-fraud`)
- Scholarship counseling or grants search
