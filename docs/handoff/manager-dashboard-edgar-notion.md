# Handoff para Notion — Bloque gerencial de Edgar

NOTION: G18/G18-C1 CONFIRMADOS CERRADOS; G19 SINCRONIZADO Y VERIFICADO

Fecha de corte: 2026-10-12

Rama: `feat/manager-dashboard-edgar`

Base integrada: `2714700911293de14429f6851963168a929c0bf7`

Este archivo mantiene el historial G15–G18 y agrega G19 sin convertir pruebas sintéticas en aprobación comercial. Durante G19 el conector autorizado permitió leer contrato, historial, índice y encargo antes de actualizar. G18 y G18-C1 permanecen cerrados; no se reabren rotaciones, investigaciones ni despliegues ya finalizados.

## H1 — Implementación A+B

- Estado: completado técnicamente en `fd8ffc558553874e74e84abc5722582e8c033510`.
- Alcance: R01–R04, R06–R07, R09 y mecanismos seguros de R08/R10; A01–A07; G14.
- Datos: lotes trazables, identidad estable, ausencia sin borrado, modo de facturación explícito, acumulados idempotentes, parcialidad visible, visitas mínimas, idempotentes y con vínculo posterior auditado.
- Backend: `manager-dashboard.service.ts`, `manager-dashboard.metrics.ts`, `visits/*`, `imports/*`, schema y migraciones `20261008120000` / `20261008121000`.
- Frontend: `manager-dashboard-edgar.tsx`, dashboard route, RTK Query, import workspace, ajustes comerciales, traducciones.
- Seguridad: RLS/tenant, RBAC, CSRF, audit actor/request ID; lectura GET sin efectos.
- Bloqueos: D01, D02, D03, D04 y workbook real no disponible.
- Siguiente paso del hito: revisión de código y lectura por Edgar con un ejemplo comercial aprobado.

## H2 — Verificación C

- Estado: verificación local completada en `fb264e2f7bce96b896afda314d492c8fa1fe2cd9`; CI remoto pendiente de la rama.
- Pruebas añadidas: reglas puras, importación estable/acumulada/parcial, noviembre→diciembre, visitas con vínculo posterior, permisos y RLS.
- Evidencia: capturas sintéticas ES 1440/1024/390, ES Dark y EN; 360/375 y teclado en E2E.
- Resultado: formato/lint/typecheck/build verdes; 88 unitarias, 27 integración, 5 RLS y 8 E2E ejecutados verdes (2 omitidos por credenciales opcionales).
- Seguridad: Gitleaks sin hallazgos. Auditoría de dependencias mantiene 40 avisos heredados (2 critical/19 high); requiere pase revisado antes de merge.
- CI externo: el baseline ya presenta `quality` y `secrets` fallidos sin pasos/logs, por lo que se verificará el SHA publicado sin rebajar gates.
- Conciliación de Edgar: NO VERIFICADA; no se encontró el Excel actualizado en rutas autorizadas y no se consultaron datos remotos.
- Documentos: `docs/product/manager-dashboard-edgar.md` y `docs/audit/manager-dashboard-edgar-report.md`.
- Siguiente paso del hito: PR hacia `staging`, registrar el bloqueo/resultado de CI del SHA final y revisión humana; no merge automático.

## G15 — Remediación de dependencias y cierre de regresión

- Estado: **NO LISTO** mientras el gate real conserve el high de `braces@3.0.3`.
- Base revisada: HEAD inicial `23842f75cec14d37a245c9a97b9935e6ee6ec1de`; base `de23454048f22bf2deac295630235c181b661c04`; mismo PR #29.
- Toolchain conservada: Node 24.19.0 y pnpm 10.33.2.
- Audit inicial: 40 entradas/rutas — 2 critical, 19 high, 16 moderate, 3 low.
- Audit posterior: 4 advisories únicos — 0 critical, 1 high, 2 moderate, 1 low; `pnpm security:audit` sigue en FAIL sin ignores ni cambio de umbral.
- Corregido: Next 16.3.8, Nest 11.2.7, proxy-addr 2.0.8, Multer 2.4.0, Sharp 0.35.5, Nodemailer 10.0.16, js-yaml 4.3.2, fast-uri 3.1.8, brace-expansion 1.1.21/2.1.7/5.0.12 y source-map-js 1.2.2.
- Bloqueo: `eslint-config-next@16.3.8 → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`; GHSA-vfj7-8cjw-p6xm declara ausencia de versión parcheada y el seguimiento upstream no ofrece release/PR oficial utilizable. No se retiró lint ni se introdujo fork/override.
- Regresión: format/lint/typecheck/build PASS; 88 unitarias, 27 integración, 5 RLS; Prisma válido con seis migraciones en BD Docker desechable.
- E2E: 10 ejecutados, 10 aprobados, 0 fallidos y 0 omitidos, sin retries; Seller y Executive/Viewer antes omitidos ahora se ejecutan, y los recorridos gerenciales usan un Manager real.
- Runtime: imagen API PASS y health local live/ready 200; standalone web Next 16.3.8 sirvió login ES y assets.
- Staging read-only: health Railway verde, pero API activa aún resuelve las versiones heredadas de Nest/Multer/proxy-addr/Nodemailer; se recomienda backport mínimo separado. Vercel estable aún observó Next 16.3.3. No se desplegó PR #29.
- Contrato comercial: sin cambios en R01–R10/A01–A07. D01–D04, R05, R08/A05 y R10 siguen abiertos. Conciliación real NO VERIFICADA.
- Datos y entornos: sin cambios en main, staging, datos remotos, credenciales, DNS o producción. Preview sólo build, no demo integrada.
- Fuentes: advisories oficiales enlazados en `docs/audit/manager-dashboard-edgar-report.md`.
- Siguiente paso: esperar una versión oficial compatible que elimine/corrija `braces`, actualizar el lockfile y repetir audit/CI. El backport de dependencias runtime a staging debe revisarse como cambio separado, sin desplegar este PR funcional.

## G16 — Exposición residual y backport estable

- Estado de `braces`: **TOOLING ACOTADO DEMOSTRADO**; no se declara “no afectado”. La única cadena entra por ESLint/Next, está físicamente en el builder y queda excluida de la imagen final API y del standalone/NFT web. No hay ruta desde HTTP, uploads ni datos comerciales.
- Upstream: `braces@3.0.3` continúa como última versión/tag; GHSA-vfj7-8cjw-p6xm afecta `<=3.0.3` y no publica versión parcheada. Issue oficial #70 sigue abierto.
- Audit completo: exit 1, 0 critical / 1 high / 2 moderate / 1 low. Audit productivo: exit 1, 0 critical / 1 high / 2 moderate / 0 low. El high de `braces` aparece también en `--prod` por el manifiesto del paquete compartido de ESLint, no por evidencia de carga runtime.
- CI: `pull_request`, no `pull_request_target`; token/permisos de solo lectura, sin secretos de repositorio en forks; quality timeout 25 minutos; egress sin restricción explícita. Un PR puede cambiar la configuración versionada que controla `rootDir`, por lo que queda riesgo de disponibilidad del tooling.
- Excepción: **NO APLICADA**. Propuesta pendiente de aprobación para la cadena exacta, owner propuesto Jorge, revisión semanal y vencimiento 14 días después de una aprobación real, sin renovación automática. El gate crudo continúa FAIL y CI no fue suavizado.
- Backport: Draft [PR #30](https://github.com/georgenton/sales-intelligent-platform/pull/30), `fix/staging-runtime-security → staging`, desde `de234540`; sólo manifiestos/lockfile compatibles de G15 e informe técnico. Cuatro migraciones estables; no dashboard, visitas ni migraciones de octubre; no despliegue.
- Pruebas del backport: frozen install, format/lint/typecheck, 81 unitarias, 5 RLS, build, Docker API/health, web standalone, 10 escenarios E2E locales rate-aware y gitleaks pasan. Integración estable 20/21 por aserción preexistente sobre `brandPerformance[0]`; el fix test-only `23842f7` permanece fuera por el límite de alcance.
- Estado: backport preparado como Draft, no merge-ready mientras fallen el audit high y la integración estable. Runbook posterior de aprobación, deployment staging y rollback documentado pero no ejecutado.
- PR #29: actualización G16 sólo documental; conserva los 88 unit, 27 integración, 5 RLS y 10 E2E de G15 como evidencia reutilizada del SHA `da9fbf82ab5b648bc4370f2ca71bb986a2402ca1`; no se afirma reejecución.
- Comercial: R01–R10/A01–A07 sin cambios; D01–D04, R05, R08/A05 y R10 abiertos; conciliación real NO VERIFICADA; H3 NO INICIADO.
- Entornos: Railway estable sigue live/ready 200 en el artefacto anterior; Vercel estable no se movió. Main, staging, datos, credenciales, DNS y customer production sin cambios.
- Notion: sin conector autorizado en este entorno; este handoff queda pendiente de sincronización y no sobrescribe la historia ya enviada.

## G19 — Integración y revisión local del mismo PR #29

- Estado: **INTEGRADO LOCALMENTE Y LISTO PARA REVISIÓN LOCAL; PUBLICACIÓN REMOTA PENDIENTE DE AUTORIZACIÓN**.
- Rama/PR: `feat/manager-dashboard-edgar`, mismo PR #29 hacia `staging`; no se abrió PR sustituto.
- Base estable integrada: `origin/staging` `2714700911293de14429f6851963168a929c0bf7`; merge local `5ed407ef6f4cc53e877770a1be3a5d3968f159c3`.
- Conflicto: único archivo `apps/api/test/phase1-commercial.integration-spec.ts`; se conservaron fixtures/casos gerenciales y la aserción estable por `brandId`, incluida la marca sin cuota con valores `null`.
- Migrations: cuatro estables más dos funcionales, seis total; checksums coincidentes y tenant centinela conservado al pasar 4→6.
- Entorno: PostgreSQL `17.6-alpine`, API `4100`, web `3100`; seed de 40 oportunidades y perfiles sintéticos. Secretos fuera de Git en `~/.config/sales-intelligence-platform/g19-local-review.env` modo `0600`.
- Calidad nueva G19: frozen install, format/lint/typecheck/build PASS; 88/88 unitarias, 27/27 integración, 5/5 RLS, 10/10 E2E completos sin retries, 1/1 captura focalizada, 31/31 política G17 y gitleaks sin hallazgos en 97 commits.
- Seguridad: `AUDIT_RAW: FAIL` por el high exacto de `braces@3.0.3`; `SECURITY_POLICY: PASS_WITH_TIME_LIMITED_EXCEPTION`. Revisión `2026-10-19T16:59:59Z`, vencimiento absoluto `2026-10-26T16:59:59Z`; sin renovación ni cambio de alcance.
- Evidencia: siete capturas nuevas de la ejecución integrada, con 1440/1024/390, ES/EN, Light/Dark, resumen, forecast, evolución, etapas, vendedores, visitas, alertas y drawers de negocio/alerta.
- Revisión: `http://localhost:3100/app/dashboard`; usuario sintético `manager@techdistribution.demo`. La contraseña no se registra y se copia desde el archivo privado mediante `pbcopy`.
- Publicación: no se hizo push porque el check del PR demuestra que actualizar la rama crea Vercel Preview. El CI remoto verde visible pertenece al HEAD remoto anterior `157d28a`, no al HEAD local integrado.
- Entornos remotos: `staging`, `main`, Railway, Vercel estable, DNS, Coolify, datos y seis credenciales UAT permanecen sin cambios.
- Comercial: R01–R04, R06–R07, R09 y A01–A04/A06–A07 revalidados; las mecánicas seguras de R05/R08/A05/R10 se conservan sin cerrar D01–D04. Conciliación real **NO VERIFICADA**; H3 **NO INICIADO**.
- Documentos: `docs/product/manager-dashboard-edgar.md` contiene la guía de clics; `docs/audit/manager-dashboard-edgar-report.md` conserva comandos, checksums, pruebas, capturas y límites.
- Memoria: insertar G19 como actualización nueva en contrato/historial/índice/encargo, sin reemplazar G15–G18 ni marcar riesgo aceptado fuera de G17.

## G20 — Cierre funcional local

- Estado: **LISTO PARA REVISIÓN LOCAL, CON D01–D04 Y CONCILIACIÓN REAL PENDIENTES**.
- Fecha: 2026-10-13. Rama `feat/manager-dashboard-edgar`; base estable `2714700911293de14429f6851963168a929c0bf7`. El SHA local final se registra después del commit y no se publicó.
- Periodo: Pipeline 20/40, Forecast 60/80 y Backlog 90 se atribuyen por facturación prevista; cierre comercial sigue separado. Sin fecha se muestra información faltante.
- Regla 4:1: cuota menos Forecast + Backlog elegible, multiplicado por 4; ejemplos persistidos 500k→2M y (500k−250k)→1M. Facturado queda separado por D01.
- Backlog parcial: 100k−40k=60k consistente en resumen, marca/línea, vendedor, etapa, A06 y detalles; no se mueve a 100 hasta facturación completa.
- Semanas: importación publicada crea corte; replay del lote no. Último corte por semana, semana ausente omitida, tres o más puntos y dimensiones históricas inmutables.
- Equipo: pertenencia manager/seller explícita en `TenantMembership`; vendedor sin actividad visible sin ampliar el scope. Visitas sin oportunidad se conservan bajo filtros comerciales.
- UX: alertas prioritarias junto al resumen, embudo gráfico reutilizado, serie semanal pulsable, detalle exacto de importes y alertas/fechas faltantes con expansión progresiva.
- Verificación nueva: 88/88 unitarias, 28/28 integración, 5/5 RLS y 10/10 E2E sin retries; format/lint/typecheck/build PASS; siete capturas regeneradas; Gitleaks sin hallazgos.
- Seguridad: raw audit FAIL (0 critical, 1 high, 2 moderate, 1 low); G17 PASS_WITH_TIME_LIMITED_EXCEPTION sin cambios, revisión `2026-10-19T16:59:59Z`, expiración `2026-10-26T16:59:59Z`.
- Remoto: no push, merge, deploy, DNS, importación, datos ni credenciales. PR #29 remoto permanece en su HEAD anterior hasta autorización posterior.
- H3: no iniciado. Las pruebas sintéticas no equivalen a aceptación de Edgar ni conciliación del workbook vigente.

## H3 — Aceptación posterior de Edgar

- Estado: NO INICIADO.
- Requiere: validar D01 con un ejemplo; confirmar archivo/corte y modo de facturación D02; resolver ciclo/umbral D03; confirmar catálogo/personas/Upside D04.
- No debe marcarse completo por tests verdes o por existencia del dashboard.

## Texto sugerido para historial

`2026-10-08 — H1/H2: implementado Resumen gerencial — Data Center con importación semanal trazable, visitas mínimas, cálculos R01–R10 y alertas A01–A07. Verificado sólo con fixtures sintéticos y base Docker aislada. R05, R08/A05 y cumplimiento R10 siguen pendientes de definición comercial; D01–D04 permanecen abiertos. G14 implementado técnicamente. H3 no iniciado.`
