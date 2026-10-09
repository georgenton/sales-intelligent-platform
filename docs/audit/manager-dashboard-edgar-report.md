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
