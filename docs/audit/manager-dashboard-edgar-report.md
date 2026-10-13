# Auditoría de implementación — Resumen gerencial Data Center

Fecha: 2026-10-13 (cierre local G20)

Rama: `feat/manager-dashboard-edgar`

Base integrada localmente: `origin/staging` `2714700911293de14429f6851963168a929c0bf7`

Entorno verificado: Docker PostgreSQL y aplicaciones localmente aisladas. No se importaron datos de staging.

## Cierre G20

G20 corrige el horizonte comercial y completa el recorrido desde datos persistidos hasta detalle de pantalla sin cerrar D01–D04. La implementación conserva una sola fórmula backend y no modifica datos, servicios o credenciales remotos.

- Periodo: Pipeline 20/40, Forecast 60/80 y Backlog 90 usan `expectedBillingDate`; `expectedCloseDate` permanece como fecha comercial separada. Los registros sin fecha aparecen como dato faltante.
- 4:1: base = cuota − (Forecast + Backlog elegible). Los ejemplos persistidos prueban 500.000→2.000.000 y 500.000−250.000→1.000.000; Facturado queda separado por D01.
- Backlog parcial: 100.000 con 40.000 facturados deja 60.000 en resumen, marca/línea, vendedor, etapa, alerta y detalles exactos. El detalle de Facturado usa IDs de `BillingRecord`, no inferencia por etapa.
- Evolución: cada ejecución nueva de importación publicada crea un snapshot; una recarga idéntica no. La serie usa el último corte por semana, omite semanas ausentes y conserva seller/marca/línea históricos.
- Equipo/visitas: `TenantMembership.managerId` registra pertenencia explícita; un vendedor sin actividad es visible. Las visitas sin oportunidad no desaparecen bajo marca/línea y se rotulan como actividad total del vendedor.
- UX: alertas prioritarias junto al resumen, embudo existente reutilizado, barras semanales pulsables, importes/tarjetas con detalle contextual, fechas faltantes y alertas extensas bajo expansión progresiva.

Matriz local final G20 sobre datos exclusivamente sintéticos:

| Control                                  | Ejecutados | Aprobados | Fallidos | Omitidos | Resultado |
| ---------------------------------------- | ---------: | --------: | -------: | -------: | --------- |
| Unitarias API/web/shared                 |         88 |        88 |        0 |        0 | PASS      |
| Integración API                          |         28 |        28 |        0 |        0 | PASS      |
| Tenant isolation/RLS                     |          5 |         5 |        0 |        0 | PASS      |
| E2E perfiles y responsive, `--retries=0` |         10 |        10 |        0 |        0 | PASS      |
| Formato/lint/tipos/build                 |          4 |         4 |        0 |        0 | PASS      |
| Política G17                             |         31 |        31 |        0 |        0 | PASS      |
| Gitleaks historial                       |          1 |         1 |        0 |        0 | PASS      |

La integración final se repitió sobre `sales_intelligence_g20_clean`, una base desechable creada vacía para esta comprobación. Se aplicaron desde cero las ocho migraciones versionadas de la rama, se ejecutó el seed sintético y la suite completa volvió a aprobar 28/28 sin retries ni dependencia del orden de marcas. La base desechable se eliminó al terminar; la base de revisión local y cualquier entorno remoto quedaron fuera de esta prueba.

`AUDIT_RAW` permanece **FAIL** con 0 critical, 1 high, 2 moderate y 1 low. `SECURITY_POLICY` permanece **PASS_WITH_TIME_LIMITED_EXCEPTION** sólo para `braces@3.0.3`/GHSA-vfj7-8cjw-p6xm, con revisión 2026-10-19T16:59:59Z y vencimiento absoluto 2026-10-26T16:59:59Z. G20 no renueva, amplía ni modifica la excepción.

La corrida E2E limpia final fue 10/10. Dos pasadas diagnósticas anteriores no se cuentan como evidencia final: la primera detectó selectores del acordeón reemplazado por el embudo y la segunda acumuló 429 del limitador entre procesos. Se actualizaron únicamente los selectores al contrato real, se reinició el API local para limpiar estado efímero y se ejecutó la corrida completa sin retries. No se desactivó ni amplió el rate limit.

Las siete capturas versionadas se regeneraron desde la aplicación G20 ejecutada. Se comprobaron 1440/1024/390 y ausencia de overflow en 360/375; ES/EN, Light/Dark, foco, teclado, Escape y logout/protected redirect pasaron. No son prototipos ni login remoto.

## Resultado técnico

El bloque A+B está implementado sobre NestJS/Prisma/PostgreSQL y Next.js/RTK Query existentes. El cálculo se concentra en `manager-dashboard.service.ts` y funciones puras de `manager-dashboard.metrics.ts`. La UI principal es `manager-dashboard-edgar.tsx`; importación y configuración amplían flujos existentes.

El workbook real no apareció en rutas autorizadas del repositorio. Las páginas de contrato, historial, índice y encargo G19 de Notion sí se consultaron durante G19, sin que aportaran el Excel vigente ni resolvieran D01–D04. La conciliación de la carga de Edgar es **NO VERIFICADA**. Todas las evidencias versionadas usan fixtures sintéticos.

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

## Matriz de ejecución local (baseline G14)

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
- `docs/audit/evidence/manager-dashboard-edgar/opportunity-detail-1440-en-light.png`
- `docs/audit/evidence/manager-dashboard-edgar/alert-detail-1440-en-light.png`

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

## Remediación G15 — 2026-10-08

### Alcance y entorno

La remediación se ejecutó sobre `feat/manager-dashboard-edgar`, partiendo del HEAD revisado `23842f75cec14d37a245c9a97b9935e6ee6ec1de` y de `origin/staging` `de23454048f22bf2deac295630235c181b661c04`. Se conservaron Node `24.19.0`, pnpm `10.33.2`, React 19, Next 16 y Nest 11. No se cambió la semántica de `pnpm audit --audit-level high`, no se añadieron ignores/overrides y se mantuvo el override preexistente de `deepmerge-ts`.

El lockfile y los manifiestos de dependencias del HEAD revisado eran idénticos a staging: los riesgos eran heredados, pero no se consideraron aceptados. El audit inicial real devolvió código 1, 990 dependencias y 40 entradas/rutas: 2 critical, 19 high, 16 moderate y 3 low. El resultado posterior también devuelve código 1: 988 dependencias y 4 advisories únicos, 0 critical, 1 high, 2 moderate y 1 low. Por tanto, el gate completo permanece **FAIL** y G15 queda **NO LISTO** hasta resolver `braces` con una versión oficial compatible.

### Dependencias high/critical

| Paquete / uso                             | Antes → después                          | Advisory(s) del inventario                                    | Cadena y motivo                                                                          | Evidencia / estado                                                                                                                       |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js / runtime+build web               | 16.3.3 → 16.3.8                          | GHSA-vcvr-r3jv-pc5j, GHSA-cjq9-62q9-8jv4                      | dependencia directa `@sip/web`; 16.3.8 es el primer parche común para ambos rangos       | Corregido; build y standalone smoke PASS                                                                                                 |
| `eslint-config-next` / dev                | 16.3.3 → 16.3.8                          | alineación con Next; la cadena de `braces` no desaparece      | dependencia directa del paquete compartido de lint                                       | Alineado; lint PASS; bloqueo `braces` separado                                                                                           |
| Nest core/platform/testing / runtime+test | 11.2.3 → 11.2.7                          | habilita transitivos corregidos de Express/Multer             | dependencias directas de API                                                             | Corregido; unitarias, integración, RLS, Docker y health PASS                                                                             |
| `proxy-addr` / runtime API                | 2.0.7 → 2.0.8                            | GHSA-jqcg-44mw-7w3h                                           | `@nestjs/platform-express → express → proxy-addr`                                        | Corregido; `pnpm why` y runtime Docker confirman la cadena                                                                               |
| `multer` / runtime API                    | 2.2.0 → 2.4.0                            | GHSA-wc9g-mqfw-jrwm, GHSA-qfvm-cv95-jqjf, GHSA-535w-7cp7-47q4 | `@nestjs/platform-express → multer`; endpoint multipart activo                           | Corregido hasta el parche que cubre también el moderate relacionado; contratos válido/malformado/límite conservados                      |
| `sharp` / runtime/build web               | 0.35.3 → 0.35.5                          | GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w                      | `next → sharp`                                                                           | Corregido; resolución efectiva 0.35.5                                                                                                    |
| `nodemailer` / runtime API                | 10.0.0 → 10.0.16                         | GHSA-v53p-9fqp-m79j, GHSA-prgh-xp8r-p3m5                      | dependencia directa; recuperación usa proveedor inyectable                               | Corregido; proveedor de prueba PASS, sin envío real                                                                                      |
| `js-yaml` / dev                           | 4.3.1 → 4.3.2                            | GHSA-2883-xcg3-v3hh                                           | `@nestjs/cli → fork-ts-checker-webpack-plugin → cosmiconfig → js-yaml`                   | High corregido; queda `js-yaml@5.3.0` moderate fijado por `@nestjs/swagger@11.4.7`                                                       |
| `fast-uri` / dev                          | 3.1.6 → 3.1.8                            | GHSA-qw65-cvwx-89v3, GHSA-58mr-gqgx-xq4g                      | `@nestjs/cli → @angular-devkit/core → ajv → fast-uri`                                    | Corregido                                                                                                                                |
| `brace-expansion` / build+dev             | 1.1.18/2.1.4/5.0.9 → 1.1.21/2.1.7/5.0.12 | GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p                      | cadenas de minimatch en Nest CLI, ESLint y ExcelJS                                       | Corregido sin override                                                                                                                   |
| `source-map-js` / dev                     | 1.2.1 → 1.2.2                            | GHSA-68fv-2mgg-jv7q                                           | `vitest → vite → postcss → source-map-js`                                                | Corregido                                                                                                                                |
| `braces` / dev lint                       | 3.0.3 → 3.0.3                            | GHSA-vfj7-8cjw-p6xm / CVE-2026-93687                          | `eslint-config-next@16.3.8 → @next/eslint-plugin-next → fast-glob → micromatch → braces` | **BLOQUEO REAL**: advisory declara `Patched versions: <0.0.0`; no release/PR oficial utilizable y el padre compatible conserva la cadena |

Fuentes primarias revalidadas: [Next RCE](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), [Next SSRF](https://github.com/advisories/GHSA-cjq9-62q9-8jv4), [proxy-addr](https://github.com/advisories/GHSA-jqcg-44mw-7w3h), [sharp](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), [multer](https://github.com/advisories/GHSA-qfvm-cv95-jqjf), [nodemailer](https://github.com/advisories/GHSA-v53p-9fqp-m79j), [js-yaml 4.x](https://github.com/advisories/GHSA-2883-xcg3-v3hh), [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) y [seguimiento upstream de braces](https://github.com/micromatch/braces/issues/70).

### Audit antes/después

| Medida                     | Antes |             Después |
| -------------------------- | ----: | ------------------: |
| Critical                   |     2 |                   0 |
| High                       |    19 |                   1 |
| Moderate                   |    16 |                   2 |
| Low                        |     3 |                   1 |
| Entradas/rutas reportadas  |    40 | 4 advisories únicos |
| Dependencias auditadas     |   990 |                 988 |
| Gate `pnpm security:audit` |  FAIL |                FAIL |

Los restantes no high son `uuid@8.3.2` moderate vía `exceljs@4.4.0` (el parche requiere una major del transitivo), `js-yaml@5.3.0` moderate vía `@nestjs/swagger@11.4.7` y `esbuild@0.27.7` low en la toolchain de Nest (servidor de desarrollo, sólo Windows). `qs` quedó en 6.16.0. No se forzó una major ni un override para ocultarlos.

### Regresión G15

| Control                                    | Resultado                                                                                                             |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`           | PASS con Node 24.19.0 / pnpm 10.33.2; restricciones de scripts conservadas                                            |
| `pnpm format:check` / `lint` / `typecheck` | PASS                                                                                                                  |
| `pnpm test`                                | PASS; API 56, web 31, shared 1 (88 total)                                                                             |
| `pnpm test:integration`                    | PASS; 27/27, incluido SMTP de prueba, Auth/CSRF/RBAC, importación y contrato comercial                                |
| `pnpm test:tenant-isolation`               | PASS; 5/5 bajo RLS                                                                                                    |
| Prisma                                     | PASS; schema válido y seis migraciones aplicadas en PostgreSQL Docker desechable                                      |
| `pnpm build`                               | PASS; API y Next 16.3.8                                                                                               |
| Docker/runtime API                         | PASS; imagen Node 24.19.0, Nest platform 11.2.7, Nodemailer 10.0.16; `/health/live` y `/health/ready` 200/database up |
| Runtime web                                | PASS; standalone Next 16.3.8 sirvió `/login`, contenido ES y assets estáticos                                         |
| E2E local explícito                        | PASS; 10 ejecutados, 10 aprobados, 0 fallidos, 0 omitidos, 0 retries                                                  |
| Gitleaks                                   | PASS; árbol versionado exportado y `origin/staging..HEAD`, sin hallazgos                                              |
| `pnpm security:audit`                      | **FAIL esperado y conservado**; únicamente 1 high (`braces`)                                                          |

Los E2E usan una base aislada, password aleatorio efímero y los perfiles Tenant Admin, Manager, Seller, Executive y Viewer. Los dos casos antes omitidos se ejecutaron; los recorridos de Manager ahora usan `manager@techdistribution.demo`, no `adminPage`. Se validaron resumen/filtros, alertas/detalle, Seller Focus/Guided, superficies Executive/Viewer read-only, EN/ES, Light/Dark, 360/375/390/1024/1440, Escape/foco/drawer, login/logout, redirect protegido y ausencia de 5xx. El harness respeta el límite real de cinco logins/minuto; no desactiva throttling ni ignora 429.

R01–R10 y A01–A07 no recibieron cambios de negocio. Los tests existentes mantienen ID estable, actualización/no-op, historial, ausencia sin borrado, acumulado 300→350, facturación parcial, trimestre, alertas sin mutaciones automáticas, permisos y aislamiento. D01–D04, R05, R08/A05 y R10 conservan sus estados anteriores; la conciliación real sigue **NO VERIFICADA**.

### Exposición read-only y despliegue

La API activa de Railway staging respondió 200 en `/health/live` y 200/database up en `/health/ready`. El deployment activo observado fue `010ea649-a4eb-4ab4-a48e-561eed2b8d78` sobre commit `125ad6f6e05121b363d7982d4195bb32c88b25d6`; staging `de234540` fue omitido por watched paths. Esa API todavía resolvía Nest 11.2.3, Multer 2.2.0, proxy-addr 2.0.7 y Nodemailer 10.0.0. El upload multipart y correo son rutas runtime activas: se recomienda un backport mínimo separado a staging. La configuración usa `trust proxy = 1`; no se ejecutó exploit ni carga remota.

El alias estable de Vercel observado estaba Ready sobre `912ee9497e7134098d5e65485cb9f1095656db0c` y Next 16.3.3. No se encontraron usos de `next/og`, `ImageResponse` ni imágenes remotas en la configuración actual, pero esto no convierte la versión vulnerable en aceptable. La Preview de PR #29 se trata exclusivamente como build; no se apunta al backend compartido ni se presenta como demo integrada.

No se modificaron main, staging, Railway, Vercel estable, datos remotos, DNS, credenciales ni producción. El SHA final y la CI exacta se registran en la entrega del PR una vez publicados los commits G15.

## G16 — Exposición residual y backport de seguridad — 2026-10-08

### Decisión técnica sobre `braces`

La revalidación única de [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), las [releases oficiales](https://github.com/micromatch/braces/releases), npm y [micromatch/braces#70](https://github.com/micromatch/braces/issues/70) confirma que `3.0.3` sigue siendo la versión/tag más reciente, el rango afectado es `<=3.0.3` y no existe versión oficial parcheada. No se utilizó fork, commit no publicado, override ni falsificación de versión.

Clasificación: **TOOLING ACOTADO DEMOSTRADO**.

La única cadena es `packages__eslint-config > eslint-config-next@16.3.8 > @next/eslint-plugin-next@16.3.8 > fast-glob@3.3.1 > micromatch@4.0.8 > braces@3.0.3`. `@next/eslint-plugin-next` usa `fast-glob.globSync` para un `settings.next.rootDir` configurable; la configuración versionada actual no define ese valor y usa `context.cwd`. Un PR no confiable sí puede modificar la configuración de lint, por lo que queda un riesgo de disponibilidad de tooling/CI, no una afirmación de “no afectado”. No se encontró camino desde uploads, parámetros HTTP ni campos comerciales hacia ese parser.

Los módulos existen físicamente en el store pnpm del builder. No existen ni son resolubles en la imagen final reproducible de API; tampoco aparecen en el standalone web ni en sus 37 manifiestos NFT. La Preview Vercel de `da9fbf8` confirma instalación de todos los workspaces durante build y generación posterior de `/vercel/output`; la CLI expone funciones/logs, no un filesystem/SBOM remoto completo, por lo que la exclusión runtime web se apoya en el standalone y las trazas locales reproducibles, no en una sola búsqueda remota.

### Audit separado

| Diagnóstico                           | Exit | Critical | High | Moderate | Low |
| ------------------------------------- | ---: | -------: | ---: | -------: | --: |
| Completo `pnpm audit --json`          |    1 |        0 |    1 |        2 |   1 |
| Productivo `pnpm audit --prod --json` |    1 |        0 |    1 |        2 |   0 |

El audit productivo incluye `braces` porque el paquete compartido de ESLint declara sus herramientas como `dependencies`; no reemplaza el gate ni prueba carga runtime. El gate `pnpm security:audit` permanece sin cambios y en **FAIL**.

### Trust boundary de CI

CI usa `pull_request`, nunca `pull_request_target`; checkout e instalación ejecutan código versionado no confiable, con permisos por defecto de solo lectura, sin secretos del repositorio para forks, timeout de 25 minutos y cancelación concurrente por ref. El job de secretos limita `GITHUB_TOKEN` a `contents: read` y `pull-requests: read`. No hay restricción explícita de egress. No se ejecutó exploit ni prueba de DoS.

### Propuesta temporal, no aplicada

Se documenta una propuesta limitada al advisory, versión y cadena exactos anteriores, con responsable propuesto Jorge, estado **PENDIENTE DE APROBACIÓN**, revisión semanal y vencimiento propuesto 14 días después de una aprobación real. No existe aprobación, fecha activa ni renovación automática. Sus condiciones propuestas exigen cero high/critical runtime, ninguna cadena nueva, lint/tests/audit visibles, revisión ante cualquier cambio y eliminación inmediata al existir parche oficial compatible.

**Excepción: NO APLICADA.** El audit crudo continúa en FAIL; no hay política con excepción aprobada ni se editó CI.

### Backport estable

Se creó desde `origin/staging` `de23454048f22bf2deac295630235c181b661c04` el worktree/branch independiente `fix/staging-runtime-security` y el Draft [PR #30](https://github.com/georgenton/sales-intelligent-platform/pull/30). Reutiliza únicamente los cambios de dependencias compatibles de `a31eaa8e37c5de887fdd6f58e1d07bcc5d7dad88`; no incluye migraciones de octubre, entidades, dashboard, visitas ni cambios funcionales. El schema estable conserva cuatro migraciones.

Verificación del backport: frozen install, format, lint, typecheck después de Prisma generate, 81 unitarias, 5 RLS, build, Docker API live/ready, standalone web, 10 escenarios E2E locales con perfiles sintéticos y gitleaks pasan. Los E2E se dividieron respetando el límite real de cinco logins/minuto; el primer intento monolítico obtuvo el 429 esperado en el sexto login, sin desactivar throttling. La integración estable quedó 20/21: la aserción preexistente toma `brandPerformance[0]`, que puede ser una marca sin cuota creada antes en la misma suite. `23842f7` ya corrige ese test en la rama funcional seleccionando una marca configurada, pero se excluyó deliberadamente del backport por el límite G16 de no copiar tests del dashboard.

Estado del backport: **PREPARADO COMO DRAFT, NO MERGE-READY** por el gate high y el test estable descrito. Incluye informe técnico, plan posterior de revisión/despliegue y rollback sin ejecutar. Railway estable permanece en deployment `010ea649-a4eb-4ab4-a48e-561eed2b8d78`, SHA de aplicación `125ad6f6e05121b363d7982d4195bb32c88b25d6`, con live/ready 200. El alias estable de Vercel no fue movido. No hubo merge ni despliegue.

### Evidencia reutilizada y estado comercial

Este cambio en PR #29 es documental: no se repitieron los 10 E2E ni la regresión G15 de su SHA probado; se conserva la evidencia G15 enlazada a `da9fbf82ab5b648bc4370f2ca71bb986a2402ca1` y al run `37864536610`. Las pruebas nuevas anteriores corresponden exclusivamente a la base estable del Draft PR #30.

R01–R10/A01–A07 no cambian. D01–D04, R05, R08/A05 y R10 siguen abiertos; la conciliación real continúa **NO VERIFICADA** y H3 no está aceptado. Notion no se modificó porque no hay conector autorizado en este entorno; el handoff queda actualizado localmente.

## G17 — Excepción temporal aprobada — 2026-10-12

La sección G16 anterior conserva el estado histórico que tenía al cerrarse ese pase. Desde `2026-10-12T16:59:59Z`, Jorge Quizamanchuro aprobó explícitamente, bajo el identificador único `SIP-SEC-EXC-2026-001`, la siguiente excepción: “Apruebo por un máximo de 14 días la excepción temporal de braces@3.0.3, exclusivamente para el advisory y la cadena de herramientas documentados en G16, con revisión semanal, sin renovación automática y sin autorizar todavía merges ni despliegues”. La primera revisión vence el `2026-10-19T16:59:59Z` y la excepción vence de forma definitiva el `2026-10-26T16:59:59Z`; reintentos, otras ramas o nuevas ejecuciones no recalculan ni reinician esas fechas.

El alcance permitido sigue siendo exclusivamente [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), severidad high, `braces@3.0.3`, a través de `@sip/eslint-config → eslint-config-next@16.3.8 → @next/eslint-plugin-next@16.3.8 → fast-glob@3.3.1 → micromatch@4.0.8 → braces@3.0.3`, para el uso de lint/build tooling documentado en G16. La revisión oficial del advisory al inicio de G17 confirmó que el rango afectado continúa siendo `<=3.0.3`, que no existe `first_patched_version` y que el advisory no fue retirado. Esto no significa que la vulnerabilidad haya sido corregida ni que el riesgo sea cero. En particular, sigue sin existir una inspección completa del filesystem de las funciones hospedadas por Vercel.

La política está implementada como un registro estático, un evaluador dedicado y pruebas en `.github/security-policy/`; no añade dependencias ni modifica producto, runtime, schema o lockfile. El comando crudo `pnpm security:audit` conserva exactamente su semántica y sigue devolviendo `AUDIT_RAW: FAIL`. El evaluador ejecuta además el audit JSON completo y sólo devuelve `SECURITY_POLICY: PASS_WITH_TIME_LIMITED_EXCEPTION` cuando el advisory, CVE, paquete, versión, severidad, todas las rutas instaladas, usos versionados y controles de CI coinciden con el alcance aprobado. Falla cerrado ante cualquier high/critical adicional, otra ruta o uso, cambio de versión o advisory, registro ausente/revocado/inválido, informe incompleto, error de red, JSON malformado, incumplimiento de revisión semanal o llegada exacta del vencimiento. Si el high desaparece y no existe otro high/critical, la política pasa sin usar la excepción y exige cerrar el registro.

Un check de GitHub previamente verde no cambia automáticamente a rojo cuando vence la revisión o la excepción. Cualquier merge o despliegue futuro requiere una evaluación nueva sobre ese HEAD exacto mientras la vigencia continúe, además de una autorización operativa separada.

El evaluador tiene 31 pruebas aprobadas, que incluyen el caso exacto, mutaciones de GHSA/versión/ruta/uso, ruta adicional, high adicional, registro ausente/revocado/inválido, límites temporal y semanal, timestamps de revisión futuros/iguales/realizados, error de red/timeout, salida vacía/malformada/incompleta, contradicción entre audits, eliminación del high y persistencia de la fecha fija entre ramas y reintentos. La ejecución real actual conserva visibles 0 critical, 1 high, 2 moderate y 1 low; el resultado diferenciado es raw FAIL y policy PASS con excepción temporal. Los controles restantes de CI —format, lint, typecheck, unitarias, integración, RLS, build y gitleaks— permanecen obligatorios.

La misma aceptación y las mismas fechas se reutilizan en PR #29 y el Draft PR #30; no son dos aceptaciones distintas. Este pase no repite E2E, imágenes, pruebas de runtime ni reconstrucciones de G15/G16: esa evidencia se reutiliza y queda distinguida de las 31 pruebas del evaluador. Tampoco modifica datos, cuentas, credenciales, Railway, Vercel estable, DNS, Coolify, `staging` o `main`, y no autoriza merge ni despliegue. Las protecciones consultadas de GitHub no muestran branch protection ni rulesets activos para `staging` o `main`; esa limitación permanece documentada y no queda compensada por la excepción.

Notion no se actualizó porque este entorno no expone un conector autorizado. El handoff saneado es este bloque G17 y debe sincronizarse sin sobrescribir la historia, sin marcar el riesgo como aceptado fuera del alcance exacto y sin declarar H3, D01–D04 ni la conciliación comercial como validados.

### Corrección puntual de revisión futura — 2026-10-12

La revisión independiente reprodujo un defecto temporal: con `now = 2026-10-12T17:40:00Z`, un clon del registro que contenía una revisión semanal fechada `2026-10-19T16:59:59Z` devolvía incorrectamente `PASS_WITH_TIME_LIMITED_EXCEPTION`. El evaluador compara ahora cada `reviewedAt` adicional contra el mismo `now` explícito recibido por `evaluateSecurityPolicy` y falla con `weekly exception review is dated in the future` cuando `reviewedAt > now`. La igualdad sigue siendo válida si se cumplen el orden, el plazo semanal y el vencimiento absoluto.

Se añadieron cuatro casos deterministas usando registros clonados: revisión futura falla, revisión válida ya realizada pasa, `reviewedAt === now` pasa y fecha inválida falla. Los 27 casos anteriores permanecen; la suite completa es 31/31. Los casos existentes conservan la prueba de revisión vencida, vencimiento absoluto exacto y registro aprobado actual vigente. El audit real continúa como `AUDIT_RAW: FAIL`, mientras la política devuelve `SECURITY_POLICY: PASS_WITH_TIME_LIMITED_EXCEPTION` con 0 critical, 1 high, 2 moderate y 1 low.

La autorización, el inicio, la revisión semanal, el vencimiento absoluto, el alcance y el historial real no cambiaron. Esta reparación no registra una revisión semanal futura ni renueva la excepción. No cambia producto, dependencias, schema, empaquetado, datos ni despliegues; los E2E, contenedores, runtime e imágenes de G15/G16 se reutilizan y no fueron ejecutados nuevamente.

## G19 — Integración de staging y revisión local — 2026-10-12

### Base, HEAD y conflicto resuelto

- PR: [#29](https://github.com/georgenton/sales-intelligent-platform/pull/29), sin merge hacia `staging`.
- HEAD remoto funcional: `157d28a776a6270aba434b26cb090c4ff610e9d5`.
- Base estable integrada: `2714700911293de14429f6851963168a929c0bf7`.
- Merge local: `5ed407ef6f4cc53e877770a1be3a5d3968f159c3`; `origin/staging` es ancestro del HEAD local.
- `main` observado y no modificado: `77c58dd7f2fa7fe791f4a478ff1d3e7e7915d22a`.

GitHub mostraba el PR remoto como `CONFLICTING/DIRTY` porque ambas ramas habían editado el mismo bloque de `apps/api/test/phase1-commercial.integration-spec.ts`. La resolución se hizo archivo por archivo: se conservaron los fixtures y casos ampliados del dashboard, y la corrección estable que selecciona la marca esperada por `brandId`, exige su cuota explícita y mantiene `null` para cuota y métricas dependientes de la marca no configurada. No se cambió el orden del backend, no se retiraron aserciones y no se tomó `ours`/`theirs` global.

El diff `origin/staging..HEAD` conserva sólo el desarrollo gerencial pendiente. Los manifiestos, lockfile, política G17, workflow CI y configuración compartida de seguridad son idénticos a staging; no se repitió una actualización de dependencias.

### Migraciones y datos sintéticos

Se creó `sip_g19_local` con PostgreSQL `17.6-alpine`, base `sales_intelligence_g19`, puertos locales API `4100`, web `3100` y PostgreSQL `5459`. Los secretos sintéticos quedaron fuera del repositorio en `~/.config/sales-intelligence-platform/g19-local-review.env`, modo `0600`.

Primero se aplicaron sólo las cuatro migraciones estables. Sus checksums SHA-256 coincidieron con los archivos versionados y se insertó el tenant centinela `g19-migration-sentinel`. Después se aplicaron las dos migraciones funcionales; las seis quedaron finalizadas y el centinela se conservó.

| Migración                                          | SHA-256                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `20260825171652_init`                              | `de41f012d14017f210f69168f63dc0bad1d54a1bf545c41d8607f316ac3c5f1e` |
| `20260906090000_phase_1_commercial_domain`         | `2a6cd1c488cf56b2cfbac312f26e00eaa585b26da4d28f31f86576f474864d65` |
| `20260907090000_phase_1_contract_corrections`      | `ceb632e55b344250ef804c44f8bdd5bbc7af9d915212726a61ece97379792297` |
| `20260907130000_phase_1_role_scope`                | `797136afcc11491b92f30005b821a949a43668f0b533eae495fde8c0914b81d6` |
| `20261008120000_manager_dashboard_edgar`           | `cb4b4da305897b4d7908a5b28fa5f9f0321f57713336c8f89b0a26617fac6b8c` |
| `20261008121000_manager_dashboard_settings_checks` | `5eb37859eb5df0f032e80cfd9653f04a59090a22b737141ad98b84be1cf175d6` |

El seed local creó 40 oportunidades sintéticas y perfiles Admin, Manager, Seller, Executive y Viewer. El rol `sip_runtime_g19` quedó `NOSUPERUSER` y `NOBYPASSRLS`; su falta de acceso directo a `_prisma_migrations` confirmó que no posee privilegios de owner. No se usaron cuentas, contraseñas, bases, imports ni datos remotos.

### Pruebas nuevas de G19

| Control                                       | Ejecutados | Aprobados | Fallidos | Omitidos | Resultado |
| --------------------------------------------- | ---------: | --------: | -------: | -------: | --------- |
| `pnpm format:check`                           |          1 |         1 |        0 |        0 | PASS      |
| `pnpm lint`                                   |          1 |         1 |        0 |        0 | PASS      |
| `pnpm typecheck`                              |          1 |         1 |        0 |        0 | PASS      |
| Unitarias API/web/shared                      |         88 |        88 |        0 |        0 | PASS      |
| Integración API                               |         27 |        27 |        0 |        0 | PASS      |
| Tenant isolation/RLS                          |          5 |         5 |        0 |        0 | PASS      |
| Build API/Next                                |          1 |         1 |        0 |        0 | PASS      |
| E2E local completo, sin retries               |         10 |        10 |        0 |        0 | PASS      |
| Captura focalizada drawer/alerta, sin retries |          1 |         1 |        0 |        0 | PASS      |
| Evaluador G17                                 |         31 |        31 |        0 |        0 | PASS      |
| Gitleaks historial completo                   |          1 |         1 |        0 |        0 | PASS      |

Dos intentos iniciales de arranque E2E fallaron en `beforeAll`, antes de ejecutar los escenarios: el primero usó `next start`, que bloqueó correctamente un `API_ORIGIN` HTTP bajo semántica de producción; el segundo usó `127.0.0.1` contra `next dev`, cuyo control de origen impidió hidratar el formulario. La ejecución válida usa `next dev` y `http://localhost:3100`, no cambia producto, no desactiva controles y terminó 10/10 sin retries.

Durante la pasada final, una ejecución intermedia de integración devolvió un único `401` en `/imports/analyze` después de que la misma suite ya hubiera pasado. El archivo comercial aislado pasó 18/18 tras un seed limpio y la integración completa volvió a pasar 27/27 también con seed limpio, sin retry de Vitest ni cambio de código. Al no reproducirse el defecto en dos corridas limpias, no se añadió una relogin artificial ni se ocultó la aserción; queda registrado como observación transitoria del harness local.

La integración cubrió de nuevo idempotencia de lote, actualización semanal con historial, ausencia sin borrado, acumulado 300→350, lote parcial visible, backlog noviembre→diciembre, visitas sin oportunidad y vínculo posterior, filtros consistentes y Manager A/B. El E2E cubrió Manager real, Seller propio, Executive/Viewer de sólo lectura, detalle de etapas y alertas, Copilot error/retry, import gate, EN/ES, Light/Dark, 1440/1024/390, teclado, foco, Escape y logout/protected redirect. La semana en curso permanece `IN_PROGRESS` y no emite falso A03.

### Seguridad G17 y CI/publicación

- `AUDIT_RAW`: **FAIL**, como está diseñado, con 0 critical, 1 high, 2 moderate y 1 low. El high sigue siendo únicamente `GHSA-vfj7-8cjw-p6xm` en `braces@3.0.3` por la cadena de tooling aprobada.
- `SECURITY_POLICY`: **PASS_WITH_TIME_LIMITED_EXCEPTION**, `SIP-SEC-EXC-2026-001`, revisión `2026-10-19T16:59:59Z`, vencimiento absoluto `2026-10-26T16:59:59Z`. No se cambió alcance, fecha, evaluador ni gate.
- Gitleaks: 97 commits y aproximadamente 4.76 MB, sin hallazgos.
- CI remoto visible: `quality` y `secrets` verdes sólo para el HEAD remoto anterior `157d28a` (run `38292595348`); no se atribuyen al HEAD local integrado.
- Publicación: **pendiente de autorización específica**. El check existente demuestra que un push a la rama dispara Vercel Preview, es decir, un despliegue remoto. G19 permite publicar sólo si no se generan deployments; por ello no se hizo push ni se actualizó el PR remoto.

No se modificaron `staging`, `main`, Railway, Vercel estable, DNS, Coolify, customer production, datos ni credenciales UAT. El worktree `fix/staging-runtime-security` y su informe local pendiente se preservaron sin cambios.

### Revisión visual local

URL efectiva: `http://localhost:3100/app/dashboard`.

| Captura                                | Ruta             | Rol     | Filtros/fecha de corte                                                                 | Fixture                                                  | Contrato evidenciado                                                                                                                                   |
| -------------------------------------- | ---------------- | ------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `desktop-1440-es-light.png`            | `/app/dashboard` | Manager | FY2026 Q4; todas las marcas, líneas y sellers; semana de 2026-10-12; Light; ES         | `tech-distribution-demo`, seed local de 40 oportunidades | R01–R04 y R06–R10; A01–A07; alcance completo de escritorio, estados no configurados y aviso de fuente no reconciliada                                  |
| `tablet-1024-es-light.png`             | `/app/dashboard` | Manager | Mismos filtros y semana; Light; ES                                                     | Mismo seed sintético                                     | R01–R10 y A01–A07 en layout tablet; navegación, densidad y ausencia de overflow                                                                        |
| `mobile-390-es-light.png`              | `/app/dashboard` | Manager | Mismos filtros y semana; Light; ES                                                     | Mismo seed sintético                                     | R01–R10 y A01–A07 en layout móvil; orden de lectura, controles y ausencia de clipping                                                                  |
| `mobile-390-es-dark.png`               | `/app/dashboard` | Manager | Mismos filtros y semana; Dark; ES                                                      | Mismo seed sintético                                     | R01–R10 y A01–A07 en tema oscuro y layout móvil                                                                                                        |
| `mobile-390-en-light.png`              | `/app/dashboard` | Manager | Mismos filtros y semana; Light; EN                                                     | Mismo seed sintético                                     | R01–R10 y A01–A07 con internacionalización y layout móvil                                                                                              |
| `opportunity-detail-1440-en-light.png` | `/app/dashboard` | Manager | FY2026 Q4; filtros globales sin restricción adicional; semana de 2026-10-12; Light; EN | Oportunidad HP sintética del mismo tenant                | Drill-down R06/R08 y contexto A05; detalle trazable sin afirmar conciliación real                                                                      |
| `alert-detail-1440-en-light.png`       | `/app/alerts`    | Manager | Ámbito autenticado del tenant; Light; EN                                               | Alerta de riesgo sintética generada por el motor local   | Navegación y detalle usados por el contrato A01–A07; la fila capturada es evidencia de interacción, no una equivalencia individual a todos los códigos |

No existe un corte semanal publicado ni una conciliación con el Excel real: la fecha visible corresponde al seed local actualizado el 2026-10-12. Las capturas no convierten esa fecha en fecha comercial aprobada.

Inicio reproducible desde la raíz del repositorio, sin imprimir secretos:

```bash
docker compose --env-file ~/.config/sales-intelligence-platform/g19-local-review.env -p sip_g19_local up -d db

set -a
source ~/.config/sales-intelligence-platform/g19-local-review.env
set +a
export PATH=/Users/jorgequizamanchuro/.nvm/versions/node/v24.19.0/bin:$PATH
DATABASE_URL="$MIGRATION_DATABASE_URL" pnpm db:migrate:deploy
DATABASE_URL="$MIGRATION_DATABASE_URL" pnpm db:seed
pnpm db:provision:runtime
pnpm --filter @sip/api start
```

En una segunda terminal:

```bash
set -a
source ~/.config/sales-intelligence-platform/g19-local-review.env
set +a
export PATH=/Users/jorgequizamanchuro/.nvm/versions/node/v24.19.0/bin:$PATH
pnpm --filter @sip/web exec next dev --webpack --port 3100
```

Para copiar la contraseña sintética del Manager al clipboard sin mostrarla:

```bash
set -a
source ~/.config/sales-intelligence-platform/g19-local-review.env
set +a
printf %s "$E2E_MANAGER_PASSWORD" | pbcopy
```

Ingresar con `manager@techdistribution.demo`. La guía de clics y la correspondencia petición → UI → fuente → limitación están en `docs/product/manager-dashboard-edgar.md`. Las siete capturas G19 son nuevas y se generaron desde la ejecución integrada; no se reutilizaron prototipos.

### Estado comercial pendiente

| Dependencia       | Estado G19                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| D01               | Abierta: falta ejemplo aprobado de TOTAL/cumplimiento global.               |
| D02               | Abierta: falta workbook vigente, corte y naturaleza de `Facturado Daily`.   |
| D03               | Abierta: falta evento final del ciclo y umbral aprobado de estancamiento.   |
| D04               | Abierta: faltan aliases, catálogo/personas y Upside respaldados por fuente. |
| Conciliación real | **NO VERIFICADA**; el seed y las capturas sintéticas no la sustituyen.      |
| H3                | **NO INICIADO**; no existe aceptación de Edgar.                             |

Notion quedó actualizado y verificado en las páginas 13, 14, índice 15 y encargo G19, sin reabrir G18-C1 ni alterar la historia de G15–G17.
