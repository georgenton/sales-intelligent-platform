# Resumen gerencial — Data Center

Fecha del contrato implementado: 2026-10-08. Cierre técnico G20: 2026-10-13. Este documento describe el alcance de la vista gerencial de Edgar y las decisiones que siguen pendientes. No sustituye una aprobación comercial ni reproduce el workbook o conversaciones de origen.

Revisión de integración G19: 2026-10-12 sobre `origin/staging` `2714700911293de14429f6851963168a929c0bf7`, sólo con datos sintéticos locales.

## Lectura principal

La ruta `/app/dashboard` presenta una sola vista gerencial para roles no Seller. Seller conserva su espacio operativo actual. Managers y administradores pueden abrir la revisión de forecast heredada como detalle mediante `?view=review`; el Copilot permanece colapsado por defecto.

Todos los KPI, desgloses, alertas y detalles se calculan en `GET /analytics/manager-dashboard` con el mismo trimestre, marca/línea, vendedor, semana y alcance autorizado. React no recalcula fórmulas comerciales.

## Contrato R01–R10

| ID  | Contrato aplicado                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| R01 | Cuota, Facturado, Forecast y Backlog se muestran para Data Center y por marca/línea sin sumar padre e hijos dos veces.                      |
| R02 | Pipeline es únicamente 20/40. La comparación requiere dos snapshots compatibles; una semana ausente no vale cero.                           |
| R03 | Una visita declarada contiene vendedor, cliente, fecha, Sí/No y vínculo opcional o posterior. La meta cuenta clientes distintos por semana. |
| R04 | La cobertura es una regla de planificación: base pendiente × multiplicador configurable (4 por defecto), no probabilidad histórica.         |
| R05 | Se conservan fechas comerciales, previstas y reales. El promedio no se publica hasta resolver D03.                                          |
| R06 | 20/40/60/80/90 muestran oportunidades; 100 representa hechos `BillingRecord`, no una oportunidad abierta.                                   |
| R07 | GM agregado = GP conocido / ingresos correspondientes. Margen desconocido no se transforma en cero.                                         |
| R08 | Sólo oportunidades OPEN con una transición fiable son evaluables. El umbral es configuración heredada, editable y auditada.                 |
| R09 | El bloque por vendedor reúne Pipeline, Forecast, Backlog, clientes distintos y margen; no crea score ni ranking.                            |
| R10 | El resumen separa Facturado, Forecast, Backlog y `Forecast + Backlog`. Cumplimiento global permanece En validación por D01.                 |

## Fórmulas y periodo

- Año fiscal: diciembre–noviembre; Q1 dic–feb, Q2 mar–may, Q3 jun–ago, Q4 sep–nov.
- Pipeline: suma completa de oportunidades OPEN en 20/40 cuya fecha esperada de facturación cae en el trimestre. La fecha de cierre comercial se conserva separada. Una fecha de facturación faltante se informa y no se sustituye silenciosamente.
- Forecast: suma completa de oportunidades OPEN en 60/80 cuya fecha esperada de facturación cae en el trimestre; no se multiplica por 0.6/0.8.
- Backlog: saldo al 90, WON, cuya fecha esperada de facturación cae en el trimestre.
- Facturado: hechos `BillingRecord` por fecha real de facturación.
- Proyección de cierre: Forecast + Backlog; no incluye Facturado. El porcentaje visible contra cuota usa esa fuente reciente, pero continúa rotulado pendiente de validación numérica D01.
- Regla 4:1: `max(cuota − (Forecast + Backlog elegible), 0) × ratio`. Facturado se informa separado y no reduce esta base mientras D01 no defina su relación.
- Margen facturado: suma de GP conocido / suma del ingreso con GP conocido.
- Data Center: etiquetas fuente HP, HPE, Nutanix y Lenovo. No se expande HIT sin fuente.
- Cuotas: sólo ámbitos exactamente configurados; una cuota total o de marca no se reparte implícitamente hacia una línea. La configuración comercial permite cuota explícita por marca/línea y la línea muestra `No disponible` cuando no existe ese ámbito.

Cuando una facturación no tiene marca explícita, el API la atribuye a Data Center o a una línea únicamente si existe una oportunidad vinculada con líneas comerciales respaldatorias; la asignación es proporcional al importe de esas líneas. Facturación sin respaldo de equipo queda fuera del agregado de un manager.

## Actualización semanal

El flujo se mantiene como analizar → confirmar mapeo → validar → ejecutar. El parser detecta el encabezado por hoja, conserva el contexto B1 de `Facturado Daily` y no trata `Orders` como factura. `Resumen` y tablas reconocidas no se importan como ventas.

- Una oportunidad necesita identidad fuente estable. Sin ella queda Pendiente.
- Mismo ID con cambios actualiza la oportunidad y registra historial con el importador real.
- Mismo archivo y contrato no crea un nuevo lote.
- Una ejecución nueva publicada crea un corte inmutable del mismo alcance. Reusar el mismo lote no crea otro corte. Varias ejecuciones en una semana se condensan al último corte de esa semana en la serie.
- Una ausencia en el corte siguiente queda en `missingFromLatest`; no borra ni declara pérdida.
- Los lotes informan altas, cambios, sin cambios, pendientes, rechazados y ausencias.
- `PARTIAL` permanece visible y nunca se presenta como conciliado.
- `TRANSACTION` exige factura o referencia de oportunidad estable.
- `CUMULATIVE` usa identidad estable por hoja/marca/ámbito y reemplaza 300 por 350, no suma 650.
- Facturación parcial reduce el saldo; sólo el agregado facturado completo mueve 90 a 100.

## Alertas A01–A07

Las alertas son derivadas por lectura y no cambian datos ni crean oportunidades. Cada tarjeta incluye tipo, entidad cuando existe, dato observado, regla, corte, importe atribuible y acción de detalle.

| ID  | Regla                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | Descenso estrictamente mayor a 10% en pipeline 20/40 entre cortes compatibles. Exactamente -10% no dispara; 40→60 se explica como avance. |
| A02 | Pipeline disponible contra base pendiente × multiplicador configurado. Sin cuota/base queda No evaluable.                                 |
| A03 | Menos clientes distintos que la meta sólo en semana cerrada; durante la semana se muestra progreso.                                       |
| A04 | Visita con Sí y sin oportunidad vinculada; una visita con No no alerta.                                                                   |
| A05 | OPEN y no 100, con última transición fiable, por encima del umbral configurado. Fecha de importación no se usa como inicio.               |
| A06 | Saldo de backlog cuya fecha prevista queda fuera del trimestre o no está informada; se presenta como contexto/dato faltante, no pérdida.  |
| A07 | Margen conocido por debajo del objetivo configurado; desconocido no equivale a 0%.                                                        |

## Permisos, trazabilidad y configuración

El endpoint hereda `analytics.read` y `opportunityReadScope`: Manager ve su equipo, Seller sólo lo propio y roles con `opportunities.read.all` el tenant. La captura y el vínculo posterior de visitas requieren permiso de creación, CSRF, referencias coincidentes de vendedor/cliente dentro del tenant e idempotencia. El vínculo no puede reasignarse silenciosamente y queda auditado. Executive y Viewer son sólo lectura.

`customer_visits`, `commercial_import_batches` y `opportunity_source_presence` tienen `ENABLE/FORCE RLS` con `USING/WITH CHECK`. Los lotes y presencias son evidencia append-only para el rol runtime. Actor, request ID y campos modificados quedan auditados.

Los valores `stalledOpportunityDays`, `weeklyVisitTarget` y `pipelineCoverageRatio` viven en `TenantSetting`, tienen límites de dominio y se administran por el endpoint/pantalla comercial ya existente.

La pertenencia vendedor→manager vive explícitamente en `TenantMembership.managerId`. Por eso un vendedor activo con cero oportunidades y cero visitas continúa visible para su manager. Crear/importar una oportunidad con manager actualiza ese vínculo mínimo; no amplía el acceso a todos los vendedores del tenant. Las visitas usan la misma pertenencia para autorizar captura y vínculo.

## Decisiones abiertas

- D01 — TOTAL: pendiente ejemplo aprobado de cumplimiento global. La interfaz sólo presenta componentes y Forecast + Backlog.
- D02 — FUENTE: pendiente workbook actualizado, corte confirmado y naturaleza transaccional/acumulada de `Facturado Daily`.
- D03 — FECHAS: pendiente evento final del ciclo y umbral aprobado de estancamiento. El valor 30 se etiqueta como heredado.
- D04 — CATÁLOGO: pendientes aliases HP/HPE/HIT, personas y Upside con fuente. No se deducen.

## Guía de revisión local G20

Abrir `http://localhost:3100/app/dashboard` después de iniciar PostgreSQL, API y web con los comandos indicados en `docs/audit/manager-dashboard-edgar-report.md`. Para recorrer el alcance gerencial se usa el usuario sintético `manager@techdistribution.demo`; la contraseña no está en Git ni en este documento y permanece en el archivo privado `~/.config/sales-intelligence-platform/g19-local-review.env` con permisos `0600`.

| Petición de Edgar                      | Dónde pulsar                                                         | Qué se ve                                                                        | De dónde sale                                                          | Estado o limitación                                                         |
| -------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| R01/R10 — resumen y forecast por marca | Tarjetas superiores y filas de `Forecast por marca y línea`          | Cuota, Facturado, Forecast, Backlog, gap y proyección del mismo filtro           | Quota, BillingRecord, Opportunity y OpportunityLineItem                | Probado sintéticamente; TOTAL/cumplimiento global sigue En validación (D01) |
| R02 — evolución semanal                | Pulsar una barra de `Evolución semanal del pipeline`                 | Serie, corte elegido, variación y movimientos del mismo filtro                   | ForecastSnapshot e dimensiones comerciales inmutables                  | Requiere cortes compatibles; una semana ausente no se dibuja como cero      |
| R04 — regla 4:1                        | `Regla de trabajo 4:1`                                               | Cuota, respaldo elegible, base pendiente, pipeline requerido y disponible        | Cuota, Forecast + Backlog y `pipelineCoverageRatio`                    | Facturado se muestra separado; su relación con D01 sigue pendiente          |
| R06 — segmentación por etapas          | Expandir 20/40/60/80/90 y seleccionar un negocio                     | Negocios justificantes y drawer de contexto con importe, responsable y evidencia | Opportunity, StageHistory y BillingRecord para 100                     | 100 es facturación, no oportunidad abierta                                  |
| R09 — desempeño por vendedor           | Tarjetas de `Desempeño por vendedor`                                 | Pipeline, Forecast, Backlog, visitas y margen del ámbito autorizado              | Agregación server-side con scope de Manager                            | Sin score ni ranking inventado                                              |
| R03 — vendedores y visitas             | `Clientes visitados`, selector de pendiente y `Vincular oportunidad` | Clientes distintos, progreso semanal, visita declarada y vínculo posterior       | CustomerVisit, Customer, Opportunity y pertenencia explícita de equipo | Filtro marca/línea no oculta visitas sin oportunidad ni fabrica A03         |
| A01–A07 — alertas                      | `Ver detalle` en la tarjeta correspondiente                          | Regla, dato observado, corte, importe, negocio y acción de contexto              | Motor determinista sobre snapshots, visitas, backlog, margen y etapa   | A05/estancamiento conserva el umbral heredado hasta resolver D03            |
| R05/R08 — ciclo y estancamiento        | `Oportunidades estancadas` y luego el negocio                        | Fechas disponibles, última transición fiable y contexto comercial                | Opportunity y StageHistory                                             | Promedio de ciclo no publicado; evento final y umbral pendientes (D03)      |

Evidencia real de la ejecución local integrada:

- `docs/audit/evidence/manager-dashboard-edgar/desktop-1440-es-light.png`: resumen, forecast, evolución, etapas, vendedores, visitas y alertas.
- `docs/audit/evidence/manager-dashboard-edgar/tablet-1024-es-light.png`: recorrido completo a 1024 px.
- `docs/audit/evidence/manager-dashboard-edgar/mobile-390-es-light.png`, `mobile-390-es-dark.png` y `mobile-390-en-light.png`: responsive, EN/ES y Light/Dark.
- `docs/audit/evidence/manager-dashboard-edgar/opportunity-detail-1440-en-light.png`: detalle justificante desde una etapa.
- `docs/audit/evidence/manager-dashboard-edgar/alert-detail-1440-en-light.png`: detalle justificante desde Alertas.

Las capturas fueron regeneradas el 2026-10-13 con el cierre G20 y contienen únicamente el seed local sintético. No sustituyen la conciliación del workbook vigente ni la aceptación de Edgar.
