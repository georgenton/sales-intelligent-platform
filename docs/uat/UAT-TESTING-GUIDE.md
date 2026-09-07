# Sales Intelligence Platform — UAT Testing Guide

## 1. Purpose

This guide describes how to perform manual User Acceptance Testing against the Sales Intelligence Platform staging environment.

The goal is not only to verify that features function technically, but to evaluate whether the system helps sellers and managers make better commercial decisions.

---

## 2. Environment

### Web Staging

`https://sales-intelligence-staging-georgent.vercel.app`

### Tenant

`Tech Distribution Demo`

### Environment

`STAGING`

Production must not be used for UAT.

---

## 3. Credentials

Passwords are deliberately NOT stored in this repository.

On the authorized development Mac they are stored at:

```bash
~/.config/sales-intelligence-platform/uat-credentials.txt
```

To view them:

```bash
cat ~/.config/sales-intelligence-platform/uat-credentials.txt
```

or:

```bash
open -a TextEdit ~/.config/sales-intelligence-platform/uat-credentials.txt
```

The credentials file must remain outside Git and have permissions:

```text
600
```

---

## 4. UAT Accounts

| User         | Email                             | Role         | Primary test            |
| ------------ | --------------------------------- | ------------ | ----------------------- |
| Tenant Admin | `admin@techdistribution.demo`     | Tenant Admin | Administration          |
| Manager      | `manager@techdistribution.demo`   | Manager      | Revenue management      |
| Seller 1     | `seller1@techdistribution.demo`   | Seller       | Seller workflow         |
| Seller 2     | `seller2@techdistribution.demo`   | Seller       | Seller/RBAC comparison  |
| Executive    | `executive@techdistribution.demo` | Executive    | Executive/read analysis |
| Viewer       | `viewer@techdistribution.demo`    | Viewer       | Read-only behavior      |

If the actual codebase uses slightly different canonical RBAC names, update this table accordingly.

---

## 5. Recommended UAT Order

Perform UAT in this order:

1. Seller Standard Mode
2. Seller Focus Mode
3. Seller Guided Mode
4. Opportunity Drawer
5. Manager Revenue Command Center
6. Funnel drill-down
7. Forecast Review
8. Copilot
9. Data Import
10. Tenant Admin
11. Executive / Viewer permission checks
12. Responsive and theme testing
13. Logout/session verification

---

## 6. Seller Standard Mode

Login as:

`seller1@techdistribution.demo`

Main question:

> Do I understand what I should work on today within approximately 10 seconds?

Review:

- Likely Attainment
- Remaining Gap
- Forecast
- Billed
- Commit
- Backlog
- Pipeline Coverage
- Margin
- At Risk
- Focus Today

Evaluate:

- Is the hierarchy understandable?
- Does the system explain why an opportunity matters?
- Is the next action clear?
- Does it feel like a sales workspace rather than a reporting dashboard?

---

## 7. Seller Focus Mode

Switch to Focus Mode.

Verify that it reduces cognitive noise.

Review:

- primary objective
- priority opportunities
- recommended actions
- completed priorities
- pipeline impacted today

Evaluate:

> Does Focus Mode actually help me focus?

Do not evaluate it only as a visual theme.

---

## 8. Seller Guided Mode

Open Guided Mode.

Verify:

- queue position such as `1 of N`
- opportunity
- amount
- stage
- risk
- missing evidence
- recommended action
- structured action chips
- `Other…`
- Ask Copilot
- Next

Evaluate:

> Does this feel like useful sales coaching?

---

## 9. Seller 1 vs Seller 2

Login separately as Seller 1 and Seller 2.

Verify role behavior and seller-level access.

Attempt direct access to another seller's restricted opportunity where current RBAC rules prohibit it.

Changing a UUID manually must never bypass authorization.

---

## 10. Opportunity Drawer

From dashboard or funnel, open an opportunity.

The dashboard should remain visible in context.

Verify:

- customer
- amount
- stage
- health/risk
- seller
- brand
- partner
- next step
- owner
- next-step date
- last meaningful customer activity
- stage evidence
- missing evidence
- margin
- close date
- billing date
- stage history
- alerts

Quick actions:

- Add Activity
- Add Next Step
- Change Stage
- Update Forecast
- Add Note
- Ask Copilot

Press `Escape`.

Verify the drawer closes and keyboard focus returns correctly.

---

## 11. Manager Revenue Command Center

Login as:

`manager@techdistribution.demo`

Main question:

> Can I understand whether my team will reach quota and where intervention is required?

Review:

- Forecast
- Quota
- Gap
- delta since previous review
- Forecast Confidence
- Billed
- Commit
- Backlog
- Pipeline Coverage
- Margin
- At Risk

Important:

Missing or failed data must never appear as a false `$0` or `0%`.

---

## 12. Sales Funnel

Interact with the actual visual funnel.

Verify:

- narrowing funnel shape
- amount by stage
- opportunity count

Hover/focus should expose:

- Amount
- Opportunities
- At Risk
- Average Days in Stage
- Likely Slippage

Click `Commit`.

Verify inline expansion rather than navigation.

Review:

- Opportunities
- By Seller
- By Brand

Click an opportunity and verify the drawer opens without losing dashboard context.

---

## 13. Forecast Review Mode

Login as Manager.

Start Review Mode.

For each reviewed deal, verify:

- seller classification
- system confidence
- amount
- evidence
- missing evidence
- risks
- stage history
- forecast movement
- recommendation

Actions may include:

- Keep Commit
- Move to Upside
- Ask Seller
- Add Note
- Next

Evaluate whether this workflow could realistically be used during a weekly forecast meeting.

Phase 1 traceability checks:

1. Open a Commit opportunity and inspect the persisted 60% and 80% evidence verdicts.
2. Record **Keep Commit** and confirm it appears in Review traceability after a refresh.
3. Enter an evidence-backed question and choose **Ask Seller**.
4. Sign in as that opportunity's seller. Confirm the question appears in **Manager questions**.
5. Respond, return as Manager, and confirm the parent question is resolved with its reply.
6. Move a valid 60% or 80% opportunity to Best Case and confirm category, review event, and audit trail agree.

---

## 13A. Canonical stage and qualification flow

Use a synthetic UAT opportunity only.

1. Create it at `20 Prospecting / Prospección` with amount, GM %, close date, and line items.
2. Move it to `40 Qualification / Calificación`.
3. Attempt `60 Proposal / Propuesta` before completing the 60% gate; the change must be blocked.
4. Complete every required 60% criterion with a `YES` answer and meaningful evidence.
5. Move to 60% / Best Case.
6. Attempt `80 Negotiation / Negociación` / Commit before completing the 80% gate; it must be blocked.
7. Complete every required 80% criterion and move to 80% / Commit.
8. Verify the stage history and audit trail. No synthetic UI text may be presented as qualification evidence.

A Manager or Tenant Admin may separately test an override. The reason must be at least 10 characters and commercially meaningful. Confirm an `OVERRIDE_QUALIFICATION` review event and audit evidence are created. A Seller must never be able to override.

---

## 13B. Manager revenue and brand truth

For the active fiscal quarter, independently verify:

- quota, billed revenue, forecast, Commit, backlog, gap, coverage, and GM;
- brand rows for quota, billed, forecast, Commit, gap, attainment, and GM;
- opportunities outside the quarter do not contaminate forecast or coverage;
- coverage is unavailable with an explicit explanation when quota is missing;
- coverage says no more coverage is required when billed already fulfills quota;
- a Seller without an individual quota sees **Quota not configured**, not `$0`, and is not assigned an implicit share of team quota.

Tenant Admin can edit fiscal start, currency, GM threshold, total quota, brand quotas, optional seller quotas, and qualification criterion flags in **Commercial configuration**. Verify changes persist after refresh and affect only the active tenant.

---

## 13C. Commercial import

Use sanitized synthetic fixtures; never upload the private workbook to an unapproved environment.

1. Upload an opportunity CSV. Confirm the server-side dry run reports rows read and `READY`, `WARNING`, or `BLOCKED` without creating records.
2. Execute only a non-blocked plan and confirm imported opportunity count.
3. Upload an XLSX containing `Oppty`, `Facturado Daily`, and optionally `Resumen` / `Canales Proceso`.
4. Confirm source sheets are recognized correctly, while derived and Phase 2 sheets are not imported.
5. Execute and confirm opportunity and billing counts, billed total, brand attainment, and gap.
6. Reimport the identical file. Imported count must remain zero for the same facts and duplicates must be reported.
7. Verify no workbook row contents appear in application logs.

---

## 13D. Password recovery

1. On the login page choose **Forgot password?**.
2. Request recovery for a known and unknown address; visible responses must be identical.
3. With SMTP configured, follow the delivered one-time link.
4. Verify weak passwords are rejected and a valid strong password succeeds.
5. Confirm the old password and every pre-reset session no longer work.
6. Confirm the token cannot be reused or used after expiration.

Staging email delivery is `EXTERNAL_CONFIGURATION_REQUIRED` until the documented SMTP variables are present. Never place reset links, tokens, or passwords in UAT evidence.

---

## 14. Copilot

The current staging environment uses `MockAiProvider`.

No paid external AI is required for this UAT.

### Seller / Opportunity examples

- Why is this deal at risk?
- Is Commit justified?
- What information is missing?
- Prepare next meeting.
- Draft follow-up.

### Manager examples

- Why could we miss quota?
- What changed?
- Which sellers need intervention?
- Explain forecast movement.

Also test:

- loading
- success
- empty
- error
- retry

An error must never destroy the current workflow context.

---

## 15. Import

Current supported import capability must be shown truthfully by the application.

If CSV is the supported format, do not expect XLSX to work yet.

Verify:

1. Upload
2. Mapping
3. Validation
4. Data Quality
5. Preview
6. Import
7. Result

Mapping validation must detect:

- missing required fields
- duplicates
- ambiguous mappings
- unconfirmed automatic mappings

Data Quality should distinguish:

- READY
- WARNING
- BLOCKED

Blocked records must not be silently imported.

---

## 16. Tenant Admin

Login as:

`admin@techdistribution.demo`

Verify the capabilities currently permitted by Tenant Admin RBAC.

Focus on:

- users
- roles
- tenant settings
- available administration routes

Some administrative screens may still belong to a later UX sprint.

Functional correctness and permission enforcement are the priority.

---

## 17. Executive and Viewer

Login as:

`executive@techdistribution.demo`

and:

`viewer@techdistribution.demo`

Verify their actual RBAC behavior.

Do not treat missing dedicated Executive UX as a Sprint 1 defect if it is documented as intentionally deferred.

Viewer must remain read-only where required.

---

## 18. Appearance

Test:

- Light
- Dark
- System

Verify:

- preference persistence
- contrast
- readability
- no theme flash where possible
- status remains understandable without relying only on color

---

## 19. Language Testing

Test both:

- English
- Español

For each language:

1. Switch language from the authenticated shell.
2. Confirm the current route, opportunity drawer, Seller/Manager mode, filters, theme, session, and in-progress Redux state remain intact.
3. Refresh and confirm the language persists.
4. Logout and confirm the Login screen remains in the selected language.
5. Login again and confirm the language remains selected.
6. Verify currency, number, date, relative-time, plural, validation, error, Copilot, command palette, and accessibility labels.
7. Confirm `<html lang>` is `en` or `es` as appropriate.

Do not expect customer names, brand names, opportunity titles, IDs, stage names owned by the tenant, or internal enum values in logs to be translated.

---

## 20. Responsive Testing

Test at approximately:

### Desktop

`1440 × 1024`

### Tablet

`1024 × 768`

### Mobile

`390 × 844`

Mobile should prioritize workflow, not compress every desktop analytics widget.

---

## 21. Session Security

Test:

1. Login.
2. Open protected page.
3. Logout.
4. Attempt to reopen protected page.

Expected:

redirect to Login.

The revoked session must not continue working.

---

## 22. UAT Finding Template

Record findings using:

```text
UAT-ID:
UAT-001

Role:
Seller / Manager / Admin / Executive / Viewer

Screen:
Example: Seller Standard

Task:
What was the user trying to accomplish?

Observed:
What happened?

Expected:
What should happen?

Severity:
Critical / High / Medium / Low

Type:
Bug / UX / Business Logic / Data / Security / Enhancement

Evidence:
Screenshot or description
```

---

## 23. Evaluation Questions

Do not ask only:

> Does it work?

Also ask:

### Understanding

Do I understand what the system is telling me?

### Decision

Does it help me make a decision?

### Action

Do I know what to do next?

### Friction

Am I doing unnecessary work or navigation?

### Trust

Do I trust the data and confidence level shown?

### Intelligence

Is the system helping me think, or merely displaying data?

---

## 24. UAT Exit Criteria

UAT may be considered successful for a given workflow when:

- no Critical security or functional defects remain;
- core task can be completed;
- data semantics are trustworthy;
- user understands the next action;
- authorization behaves correctly;
- no unexplained HTTP 5xx or console failures occur.

P1/P2 design enhancements that do not block the workflow may remain scheduled for later sprints.

---

## 25. Important Security Rule

Never commit:

- UAT passwords
- `.env`
- credential files
- real customer spreadsheets
- tokens
- session values

The repository guide deliberately contains usernames only.
