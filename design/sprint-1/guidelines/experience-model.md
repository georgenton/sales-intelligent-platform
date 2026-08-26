# 2 · Experience model — seller vs manager

## The two questions

| | Seller | Manager |
|---|---|---|
| Question | *What should I do today to maximise my chance of reaching quota?* | *Will my team reach quota, and where do I intervene?* |
| Time horizon | Today and this week | This quarter, versus Monday |
| Unit of work | One opportunity, one action | One seller, one risk concentration |
| Success | The list is empty | The gap is explained and assigned |
| Emotional register | Momentum | Control |

## Seller home — "My day"

Hierarchy, top to bottom, non-negotiable:

1. **Personal quota** — `QuotaProgress` (billed solid, forecast translucent, quota tick)
2. **Billed** · **Forecast** · **Remaining gap** — three `RevenueKPI` tiles, each with its attainment qualifier
3. **Focus today** — at most three `NextBestAction` cards. More than three is a list, not a focus.
4. **My funnel** — personal `SalesFunnel` with in-place drill-down
5. **Stuck opportunities** — `StageVelocity` per deal, benchmark-relative
6. **Customer meetings** — next five working days
7. **Copilot** — seller-context suggestions

It must not read as an executive analytics dashboard. No team data, no brand splits, no forecast-accuracy trend. Every card either shows a number the seller owns or an action the seller can take.

**Focus-today anatomy** — the pattern is fixed: customer · amount · category, then `Risk ·` one sentence of evidence, then `Suggested ·` the move, then one primary button and "Open deal". A card without a *why* is not shippable.

## Manager home — "Revenue Command Center"

1. **Quota progress** and the KPI cluster: pipeline (with coverage ×), commit, margin
2. **`QuotaGap`** — the management interpretation, adjacent to the numbers and visually louder than any single KPI: *"Your current forecast is \$390K below quota. Three opportunities representing \$510K account for most of the quarter risk."* → **Review risks**
3. **Interactive funnel** with stage drill-down (opportunity list · seller breakdown · brand breakdown)
4. **Forecast movement** since the last snapshot
5. **Brands**
6. **Team** — `SellerPerformance`, commit mix under 25% is the intervention cue

**Never ten equal KPI cards.** The gap interpretation and quota progress own the top; everything else is secondary. Ten equal tiles is the failure mode this design exists to prevent.

## Executive

Same command center, re-weighted: attainment and trend first, single-deal detail suppressed, narrative (`QuotaGap` interpretation + `CopilotInsight`) promoted. No row-level editing.

## Cognitive modes

Modes are orthogonal to light/dark appearance — a user can be in dark Focus mode.

| Mode | Shows | Suppresses | Exit |
|---|---|---|---|
| **Standard** | Everything above | — | — |
| **Focus** | Goal, quota progress, today's priorities, critical opportunities, next actions, Copilot | Brand splits, seller roster, movement history, secondary analytics, admin entry points | Switch back |
| **Guided** | One `GuidedTask` at a time + deal context rail | Navigation noise, the Copilot rail (the task *is* the guidance) | Finish or leave |
| **Review** | One opportunity at a time: seller classification, system confidence, amount, stage, risks, missing evidence, stage history, prior forecast changes + the queue rail | Everything not about this deal | Finish the queue |

**Review mode actions**: Keep Commit · Move category · Ask seller · Add note · Next. The queue rail shows position ("Opportunity 3 of 12") and lets a manager jump — but never leaves the screen.

**Guided mode workflows**: opportunity review · missing-data completion · next-step definition · qualification · forecast preparation. One decision per step, maximum seven steps, progress always visible, every step states *why it matters commercially*.
