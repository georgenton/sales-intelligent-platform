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

## 19. Responsive Testing

Test at approximately:

### Desktop

`1440 × 1024`

### Tablet

`1024 × 768`

### Mobile

`390 × 844`

Mobile should prioritize workflow, not compress every desktop analytics widget.

---

## 20. Session Security

Test:

1. Login.
2. Open protected page.
3. Logout.
4. Attempt to reopen protected page.

Expected:

redirect to Login.

The revoked session must not continue working.

---

## 21. UAT Finding Template

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

## 22. Evaluation Questions

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

## 23. UAT Exit Criteria

UAT may be considered successful for a given workflow when:

- no Critical security or functional defects remain;
- core task can be completed;
- data semantics are trustworthy;
- user understands the next action;
- authorization behaves correctly;
- no unexplained HTTP 5xx or console failures occur.

P1/P2 design enhancements that do not block the workflow may remain scheduled for later sprints.

---

## 24. Important Security Rule

Never commit:

- UAT passwords
- `.env`
- credential files
- real customer spreadsheets
- tokens
- session values

The repository guide deliberately contains usernames only.
