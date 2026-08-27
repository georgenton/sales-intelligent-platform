# UX Density and Internationalization

## Scope

This sprint makes the existing Sprint 1 surfaces denser and available in English and Spanish. It does not add product workflows, change route shapes, or alter opportunity, authorization, tenancy, or session semantics.

Compact is the only density mode. Light, Dark, and System remain the only appearance modes.

## Density audit

The baseline was the `staging` branch at `25dbcc98766d2b776acefc3a125750af8ab47fe3`.

| Surface                | Baseline density finding                                               | Compact correction                                                                          |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Seller Standard        | 20 px card padding, 24–32 px page padding, repeated vertical KPI cards | 16 px semantic card padding, 12–24 px responsive page padding, tighter KPI grid             |
| Seller Focus           | 20 px row padding and 16 px internal gaps                              | 16 px row padding and 12 px internal gaps; touch target remains at least 44 px              |
| Seller Guided          | 20 px card padding; controls mixed between 32 and 48 px                | 16 px cards and a 42 px control token, promoted to 44 px on coarse pointers                 |
| Manager Command Center | 64 px shell header, 32 px XL page inset, 20 px cards                   | 56 px shell header, 24 px XL inset, 16 px cards; more KPI and funnel content above the fold |
| Funnel Expanded        | 20 px card padding and 20 px detail separation                         | 16 px card padding with compact 16 px grid rhythm                                           |
| Forecast Review        | 20 px cards and mixed control heights                                  | 16 px cards and semantic controls; mutation states remain explicit                          |
| Opportunity Drawer     | 20 px header/body padding and five 20 px-separated sections            | 16 px semantic padding and compact section rhythm without reducing dialog clarity           |
| Opportunities          | Approximately 52 px body rows (`py-4`) and 40 px headers               | 44 px semantic table rows with `py-2` content padding                                       |
| Alerts                 | 16 px cards with 16 px gaps                                            | Retained readable card padding; outer grid tightened to 12 px                               |
| Import                 | 24–32 px upload/confirmation panels and mixed 36/40 px controls        | Semantic controls and table rows; validation warnings retain larger safety padding          |

### Viewport observations

| Viewport    | Baseline                                                                                     | Compact result                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1440 × 1024 | 248 px sidebar, 330 px Copilot, 64 px header, 32 px content inset limited the center column  | 56 px header and 24 px inset recover vertical and horizontal space without changing shell structure |
| 1024 × 768  | 72 px rail, 24 px page inset, modal Copilot; tall cards pushed funnel details below the fold | 20 px page inset, 16 px cards, 44 px rows and consistent 42 px controls improve scan density        |
| 390 × 844   | 16 px page inset and mixed small controls; desktop cards stacked correctly                   | 12 px page inset; all coarse-pointer buttons, selects, and inputs stay at least 44 px               |

## Canonical density tokens

The source of truth is `apps/web/src/app/globals.css`.

| Token                        | Compact value | Use                       |
| ---------------------------- | ------------- | ------------------------- |
| `--density-card-padding`     | 16 px         | Card headers and bodies   |
| `--density-grid-gap`         | 16 px         | Primary grids             |
| `--density-section-gap`      | 24 px         | Major page sections       |
| `--density-control-height`   | 42 px         | Buttons, inputs, selects  |
| `--density-table-row-height` | 44 px         | Data tables               |
| `--type-page-title`          | 28–32 px      | Page questions and titles |
| `--type-kpi-primary`         | 36–44 px      | Primary revenue KPI       |
| `--type-kpi-secondary`       | 24–28 px      | Secondary KPIs            |
| `--type-section-title`       | 18–22 px      | Section titles            |
| `--type-body`                | 14 px         | Product body copy         |
| `--type-meta`                | 12 px         | Metadata                  |
| `--line-body`                | 1.5           | Default body leading      |

No density selector or alternative density state exists.

## Locale architecture

- Library: `next-intl` 4.14.0 with the Next.js 16 App Router plugin.
- Routes: unchanged. Locale prefixes are intentionally not used.
- Default: English (`en`). Supported locales are `en` and `es`.
- Request configuration: `apps/web/src/i18n/request.ts` reads `sip_locale` on the server and loads one catalog.
- Provider: the root layout resolves the request locale, sets `<html lang>`, and provides messages and `America/Guayaquil` to client components.
- Persistence: the authenticated shell invokes a validated Server Action that writes only the `sip_locale` preference cookie for one year. The cookie is independent of `sip_session` and `sip_csrf`, so logout does not remove it.
- Selector: text-only English/Español selector in the authenticated shell. It calls `router.refresh()`, preserving the URL and mounted client state rather than navigating to a locale route.
- Catalogs: `apps/web/messages/en.json` and `apps/web/messages/es.json`, organized by common, navigation, auth, seller, manager, opportunities, forecast, alerts, copilot, import, guided, review, validation, errors, and accessibility namespaces.

## Presentation boundaries

Internal API enums, database values, customer names, opportunity titles, stage names, brand names, identifiers, and audit/log values are not mutated. Status, role, forecast category, alert, import-field, and Copilot-intent labels are translated only when rendered.

Guided and Review decisions store stable action IDs in Redux. Localized labels are never used as mutation conditions. Copilot prompt chips similarly retain stable intent IDs (`RISK`, `COMMIT`, `MISSING`, `MEETING`, `FOLLOW_UP`) independent of their visible language.

## Sales glossary

| English           | Spanish               |
| ----------------- | --------------------- |
| Forecast          | Pronóstico            |
| Pipeline          | Pipeline              |
| Sales Funnel      | Embudo de ventas      |
| Commit            | Commit                |
| Backlog           | Backlog               |
| Billed            | Facturado             |
| Quota             | Cuota                 |
| Gap               | Brecha                |
| Attainment        | Cumplimiento          |
| Likely Attainment | Cumplimiento estimado |
| At Risk           | En riesgo             |
| Opportunity       | Oportunidad           |
| Seller            | Vendedor              |
| Sales Manager     | Gerente comercial     |
| Next Step         | Próximo paso          |
| Close Date        | Fecha de cierre       |
| Billing Date      | Fecha de facturación  |
| Margin            | Margen                |
| Forecast Review   | Revisión de forecast  |
| Focus Mode        | Modo enfoque          |
| Guided Mode       | Modo guiado           |
| Review Mode       | Modo revisión         |
| Standard Mode     | Modo estándar         |

## Formatting contracts

Formatting is centralized in `apps/web/src/i18n/formatters.ts`.

- Currency uses `en-US` or `es-EC`, with compact notation at one million and above: `$3.6M` / `$3,6 M`; `$390,000` / `$390.000`.
- Numbers use the selected locale’s decimal and group separators.
- Dates and date-times use `America/Guayaquil`.
- Relative time uses `Intl.RelativeTimeFormat` with locale-aware terms such as `yesterday` / `ayer`.
- ICU message syntax handles singular, plural, and zero states in frequently counted surfaces.

## Copilot localization

The existing `MockAiProvider` remains deterministic and free. The web client passes only a validated `en` or `es` value through `Accept-Language`; the provider formats and returns its manager brief in that language. No paid AI service or provider behavior was introduced.

## Accessibility

- Language names are written as text; flags are not used.
- Locale-aware labels cover navigation, dialogs, drawers, command palette, controls, status/error announcements, and keyboard hints.
- `<html lang>` follows the selected locale on the server.
- `aria-live`, `role=status`, `role=alert`, focus traps, Escape handling, and focus restoration are retained.
- Coarse-pointer interactive controls remain at least 44 px even though desktop density is compact.

## Verification contract

Automated coverage includes catalog parity, supported locale validation, ICU plurals, currency/number/date/relative-time formatting, stable Copilot intent IDs, localized mock responses, validation behavior, theme persistence, route preservation, locale cookie persistence, and logout persistence. Manual responsive evidence is collected at 1440 × 1024, 1024 × 768, and 390 × 844.
