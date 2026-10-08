# Handoff para Notion — Bloque gerencial de Edgar

NOTION: PENDIENTE DE SINCRONIZACIÓN

Fecha de corte: 2026-10-08

Rama: `feat/manager-dashboard-edgar`

Base: `de23454048f22bf2deac295630235c181b661c04`

Este archivo está preparado para incorporar el avance a las páginas de contrato, hitos e historial sin convertir supuestos en aprobaciones. Las URLs de Notion no fueron legibles desde este entorno; no se sobrescribió contenido remoto.

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

## H3 — Aceptación posterior de Edgar

- Estado: NO INICIADO.
- Requiere: validar D01 con un ejemplo; confirmar archivo/corte y modo de facturación D02; resolver ciclo/umbral D03; confirmar catálogo/personas/Upside D04.
- No debe marcarse completo por tests verdes o por existencia del dashboard.

## Texto sugerido para historial

`2026-10-08 — H1/H2: implementado Resumen gerencial — Data Center con importación semanal trazable, visitas mínimas, cálculos R01–R10 y alertas A01–A07. Verificado sólo con fixtures sintéticos y base Docker aislada. R05, R08/A05 y cumplimiento R10 siguen pendientes de definición comercial; D01–D04 permanecen abiertos. G14 implementado técnicamente. H3 no iniciado.`
