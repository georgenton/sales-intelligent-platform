# Auditoría de implementación — Resumen gerencial Data Center

Fecha: 2026-10-08

Rama: `feat/manager-dashboard-edgar`

Base: `origin/staging` `de23454048f22bf2deac295630235c181b661c04`

Entorno verificado: Docker PostgreSQL y aplicaciones localmente aisladas. No se importaron datos de staging.

## Resultado técnico

El bloque A+B está implementado sobre NestJS/Prisma/PostgreSQL y Next.js/RTK Query existentes. El cálculo se concentra en `manager-dashboard.service.ts` y funciones puras de `manager-dashboard.metrics.ts`. La UI principal es `manager-dashboard-edgar.tsx`; importación y configuración amplían flujos existentes.

El workbook real no apareció en rutas autorizadas del repositorio y las cuatro páginas de Notion no fueron accesibles desde este entorno. La conciliación de la carga de Edgar es **NO VERIFICADA**. Todas las evidencias versionadas usan fixtures sintéticos.

## Matriz contractual

| ID  | Ubicación                             | Fuente                                    | Prueba principal                                  | Estado                           |
| --- | ------------------------------------- | ----------------------------------------- | ------------------------------------------------- | -------------------------------- |
| R01 | Resumen + Forecast por marca/línea    | Quota, BillingRecord, OpportunityLineItem | integración de filtros + E2E                      | IMPLEMENTADO Y PROBADO           |
| R02 | Evolución semanal                     | ForecastSnapshot/Item                     | unitarias -10/-12/sin base/40→60                  | IMPLEMENTADO Y PROBADO           |
| R03 | Clientes visitados + formulario       | CustomerVisit                             | No/Sí, vínculo posterior, idempotencia y RBAC     | IMPLEMENTADO Y PROBADO           |
| R04 | Regla de trabajo 4:1                  | TenantSetting + cuota/facturado           | unitarias 500k→2M, 250k→1M y sin cuota            | IMPLEMENTADO Y PROBADO           |
| R05 | Detalle junto a estancadas            | fechas de oportunidad/facturación         | estado explícito D03                              | PENDIENTE DE FUENTE O DEFINICIÓN |
| R06 | Segmentación por etapas               | Opportunity y BillingRecord               | integración + drawer E2E                          | IMPLEMENTADO Y PROBADO           |
| R07 | Resumen, vendedor y A07               | BillingRecord/line items con GP           | ponderación conocido/desconocido                  | IMPLEMENTADO Y PROBADO           |
| R08 | Oportunidades estancadas              | StageHistory fiable + TenantSetting       | fechas válidas/nulas/status + missing information | PENDIENTE DE FUENTE O DEFINICIÓN |
| R09 | Desempeño por vendedor                | agregación autorizada única               | aislamiento Manager A/B                           | IMPLEMENTADO Y PROBADO           |
| R10 | Resumen general                       | servicio gerencial                        | componentes separados + D01 visible               | PENDIENTE DE FUENTE O DEFINICIÓN |
| A01 | Alertas Vendedores/marcas + evolución | snapshots compatibles                     | exacto -10%, -12%, sin comparación, 40→60         | IMPLEMENTADO Y PROBADO           |
| A02 | Alertas + bloque 4:1                  | cuota y base pendiente explícita          | suficiente/insuficiente/no evaluable              | IMPLEMENTADO Y PROBADO           |
| A03 | Alertas + desempeño                   | clientes distintos por semana             | semana cerrada/en progreso y duplicados           | IMPLEMENTADO Y PROBADO           |
| A04 | Alertas Negocios                      | CustomerVisit                             | Sí pendiente, vínculo posterior / No válido       | IMPLEMENTADO Y PROBADO           |
| A05 | Alertas Negocios + estancadas         | transición fiable                         | status/fecha/umbral y dato faltante               | PENDIENTE DE FUENTE O DEFINICIÓN |
| A06 | Alertas Negocios                      | fecha prevista + saldo                    | noviembre→diciembre, sin duplicación              | IMPLEMENTADO Y PROBADO           |
| A07 | Alertas Negocios                      | GM/GP conocido + objetivo                 | ponderación y unknown≠0                           | IMPLEMENTADO Y PROBADO           |

Los estados pendientes significan que la mecánica segura existe, pero falta la definición comercial de Edgar. No se presenta desarrollo técnico como aceptación H3.

## Pruebas y conciliación sintética

- Dos cargas con mismo ID conservan el UUID, actualizan importe/etapa y crean StageHistory.
- Recarga idéntica reutiliza el lote y no duplica oportunidad, facturación ni corte.
- La ausencia posterior aumenta `missingFromLatest` y conserva la oportunidad.
- Acumulado 300→350 deja un registro de 350.
- Lote explícitamente parcial se publica `PARTIAL` y la UI lo muestra no conciliado.
- Backlog con facturación noviembre→diciembre sale del total del trimestre y aparece como A06 contexto.
- Facturación parcial deja saldo pendiente y no mueve prematuramente a 100.
- Una visita con Sí queda pendiente, puede vincularse después una sola vez, elimina A04 y rechaza acceso del Manager B.
- RBAC y agregados se prueban con Manager A/Manager B, Seller, Tenant Admin, Executive y Viewer.
- Las tablas nuevas se prueban bajo el rol `app_runtime` con RLS cruzado entre dos tenants.

## Matriz de ejecución local

| Control                          | Resultado                                                                   |
| -------------------------------- | --------------------------------------------------------------------------- |
| Prisma generate / migrate status | PASS; 6 migraciones aplicadas en PostgreSQL Docker aislado                  |
| `pnpm format:check`              | PASS                                                                        |
| `pnpm lint`                      | PASS                                                                        |
| `pnpm typecheck`                 | PASS                                                                        |
| `pnpm test`                      | PASS; API 56, web 31 y shared 1                                             |
| `pnpm test:integration`          | PASS; 27 casos                                                              |
| `pnpm test:tenant-isolation`     | PASS; 5 casos bajo RLS                                                      |
| `pnpm build`                     | PASS; API y Next.js production build                                        |
| E2E local aislado                | PASS; 8 ejecutados, 2 omitidos por credenciales opcionales no suministradas |
| Gitleaks                         | PASS; 77 commits y aproximadamente 4.30 MB, sin filtraciones                |
| `pnpm audit --audit-level high`  | FINDINGS; 40 avisos heredados: 2 critical, 19 high, 16 moderate y 3 low     |

No se modificaron dependencias en este encargo. Los avisos críticos incluyen Next.js 16.3.3 y un transitivo de Express; deben resolverse en un pase de actualización revisado antes de merge, sin mezclar upgrades indiscriminados con el contrato comercial.

El run de CI del baseline `de234540` ya terminaba en fallo externo con `quality` y `secrets` sin pasos ejecutados ni logs disponibles. El SHA del PR se reconsulta tras publicar; no se elimina ni suaviza ningún gate para obtener verde artificial.

## Evidencia visual sintética

- `docs/audit/evidence/manager-dashboard-edgar/desktop-1440-es-light.png`
- `docs/audit/evidence/manager-dashboard-edgar/tablet-1024-es-light.png`
- `docs/audit/evidence/manager-dashboard-edgar/mobile-390-es-light.png`
- `docs/audit/evidence/manager-dashboard-edgar/mobile-390-es-dark.png`
- `docs/audit/evidence/manager-dashboard-edgar/mobile-390-en-light.png`

El mismo recorrido valida 360/375 sin overflow, teclado sobre filtros/desgloses, drawer/Escape, EN/ES y Light/Dark. La bandera de captura sólo funciona junto con `E2E_ALLOW_LOCAL=true`, evitando versionar accidentalmente pantallas remotas.

## Seguridad y límites

- Ninguna migración, reseed, importación, cuenta o dato remoto fue modificado.
- No se añadió servicio, cron, canal externo, IA pagada ni motor genérico.
- `main`, staging y customer production permanecen sin cambios.
- No se publicaron workbook, transcripts, fotografías ni credenciales.
- Las mutaciones de visita/importación conservan sesión, CSRF, RBAC, tenant scope, RLS y auditoría.
- El replay de visita valida alcance antes de devolver el recurso; Manager A no puede leer ni vincular una visita del equipo B mediante la clave idempotente.
- El Copilot queda colapsado por defecto y la revisión heredada se abre sólo bajo acción explícita.
- Vercel está enlazado al repositorio y crea Preview por rama. Como el Preview usa un `API_ORIGIN` de Preview hacia el backend compartido aún sin este contrato, sólo se admite verificar su build; no se ejecutan login ni mutaciones remotas en este bloque.

## D01–D04

| Decisión | Tratamiento implementado                                                               | Pendiente real                                             |
| -------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| D01      | Facturado, Forecast, Backlog y Forecast+Backlog separados; cumplimiento En validación. | Ejemplo aprobado del TOTAL.                                |
| D02      | Modo TRANSACTION/CUMULATIVE obligatorio, corte y parcialidad explícitos.               | Archivo/corte actual y naturaleza real de Facturado Daily. |
| D03      | Fechas capturadas; promedio no calculado; 30 días identificado y configurable.         | Evento final y umbral de Edgar.                            |
| D04      | Sólo etiquetas HP/HPE/Nutanix/Lenovo; alias marcado pendiente.                         | Personas, HP/HPE/HIT y Upside con fuente.                  |

NOTION: PENDIENTE DE SINCRONIZACIÓN.
