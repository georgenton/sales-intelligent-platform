# OVH/Coolify — publicación de Sales Intelligence Platform

Estado de este documento: paquete G21 ensayado localmente y ejecución G23 completada el 2026-10-13 con Demo y Staging operativos y Producción provisionada/detenida. La sección "Registro G23" contiene únicamente evidencia observada del despliegue remoto.

Producto ensayado: `eadc24080b1b90e0b1759fbefc63c098eaedf9cb` (`feat/manager-dashboard-edgar`). El commit de infraestructura G21 se registra al cerrar esta rama.

## Topología

```text
Internet → HTTPS/Traefik → web:3000 → /backend → api:4000 → db:5432
                            pública     red privada    red privada
```

Sólo `web` recibe dominio y ruta de Traefik. `api` y `db` usan `expose`, no `ports`, y no montan el socket Docker. `API_ORIGIN=http://api:4000` es exclusivamente server-side y sólo se acepta en producción para ese host/puerto Compose exacto. El navegador conserva una sesión opaca same-origin, cookies Secure, CSRF y respuestas `no-store`.

Los contenedores Node usan `node:24.19.0-alpine` fijado al índice multi-arquitectura `sha256:d32cdf...ad43`; PostgreSQL usa `postgres:18.4-alpine` fijado a `sha256:9a8afc...de15`. Web y API reciben `SIP_BUILD_SHA` como etiqueta OCI `org.opencontainers.image.revision`.

## Inventario READ observado

Observación sin cambios del 2026-10-13:

| Recurso          | Estado observado                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Host             | OVH Ubuntu 24.04, AMD64, 6 CPU, 11 GiB RAM; 6,2 GiB usados y 5,2 GiB disponibles                      |
| Disco/inodos     | `/` 96 GiB, 49 GiB usados, 48 GiB disponibles; 16% de inodos usados                                   |
| Docker           | 29.8.1, overlayfs, 30,72 GiB de imágenes, 11,17 GiB de volúmenes, 2,74 GiB de build cache             |
| Resiliencia host | sin swap; Docker live-restore desactivado                                                             |
| Coolify          | 4.4.6; servidor alcanzable/utilizable; Traefik 3.6 healthy                                            |
| Carga            | 24 contenedores activos durante la lectura; no se ejecutó stress, prune ni inspección de datos ajenos |
| SIP              | no existe proyecto, aplicación, base, volumen ni dominio de SIP en Coolify                            |

La capacidad observada permite Demo y Staging con observación secuencial; no garantiza margen bajo build ni aprueba Producción viva. Los límites por stack suman 3,25 CPU y 3,75 GiB máximos; las reservas suman 960 MiB. G23 autorizó recursos SIP nuevos y aislados, por lo que se despliega uno por vez, con build fuera del VPS y sin ejecutar `prune`.

## Ambientes aislados

Usar el mismo `compose.coolify.yml` con un archivo secreto distinto por ambiente. Nunca compartir base, roles, contraseñas, volumen, redes o nombre Compose.

| Ambiente          | `SIP_ENVIRONMENT` | Base propuesta   | Rol runtime propuesto    | Dominio propuesto, no creado  | Datos                          |
| ----------------- | ----------------- | ---------------- | ------------------------ | ----------------------------- | ------------------------------ |
| Demo              | `demo`            | `sip_demo`       | `sip_runtime_demo`       | `demo.sales.syntavera.dev`    | sólo seed sintético            |
| Staging           | `staging`         | `sip_staging`    | `sip_runtime_staging`    | `staging.sales.syntavera.dev` | validación controlada          |
| Producción futura | `production`      | `sip_production` | `sip_runtime_production` | `sales.syntavera.dev`         | sólo tras autorización y corte |

El nombre de proyecto, volumen `postgres_data` y redes quedan namespaced por ambiente. El ejemplo versionado `deploy/coolify/environment.example` contiene sólo nombres/placeholders; la copia real vive fuera del repositorio con modo 600.

Variables permanentes:

- identificación: `SIP_ENVIRONMENT`, `SIP_BUILD_SHA` exacto;
- owner de PostgreSQL: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `MIGRATION_DATABASE_URL`;
- runtime separado: `RUNTIME_DATABASE_USER`, `RUNTIME_DATABASE_PASSWORD`, `DATABASE_URL`;
- aplicación: `APP_URL` HTTPS, `SESSION_TTL_HOURS`, `LOG_LEVEL`.

`MIGRATION_DATABASE_URL` y el password owner pertenecen al job de release, no al API en ejecución. `DEMO_ADMIN_PASSWORD`/`ALLOW_DEMO_BOOTSTRAP` y `STAGING_ADMIN_PASSWORD`/`ALLOW_STAGING_BOOTSTRAP` son efímeros para un único bootstrap y se eliminan inmediatamente. Producción no ejecuta seed.

## Gate de release

1. Revisar el SHA exacto y exigir CI completo verde sobre él.
2. Revalidar `pnpm audit --audit-level high` y `pnpm security:audit`. Mantener separados `AUDIT_RAW` y `SECURITY_POLICY`; G17 no permite ampliar ni renovar `SIP-SEC-EXC-2026-001`.
3. Confirmar backup restaurable del ambiente destino antes de migrar.
4. Crear o seleccionar un ambiente Coolify independiente. No reutilizar los recursos de SyntaVera/EIA.
5. Cargar secretos en Coolify y validar el Compose sin imprimir su expansión:

   ```bash
   docker compose --env-file /ruta/segura/demo.env -f compose.coolify.yml config -q
   ```

6. Construir desde la raíz con instalación frozen. Para G23, construir API/web AMD64 fuera del VPS, conservar el ID de imagen y la etiqueta OCI del SHA, transferirlas al host y verificar ambos valores allí. Configurar `SIP_IMAGE_PULL_POLICY=never` sólo después de esa verificación, de modo que Coolify no reconstruya ni sustituya el artefacto. En la Mac ARM64 el cross-build usa emulación: demuestra compatibilidad de construcción, no rendimiento del VPS.
7. Ejecutar una sola instancia del job de release antes de iniciar/recrear réplicas:

   ```bash
   docker compose --env-file /ruta/segura/staging.env \
     -f compose.coolify.yml --profile release run --rm migrate
   ```

   Ese job ejecuta `prisma migrate deploy` con el owner y provisiona idempotentemente el login runtime `NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`. No se ejecuta en cada arranque del API.

8. Arrancar `db`, `api` y `web`; configurar en Coolify únicamente el dominio de `web` sobre el puerto 3000. Health web: `/api/health`. Health funcional a través del proxy: `/backend/health/ready`.
9. Para Demo, ejecutar una sola vez, con variables efímeras, el comando compilado `node dist/scripts/seed.js --demo`. Para Staging usar el bootstrap staging existente. Retirar las variables inmediatamente.
10. Verificar live/ready, login, dashboard, manager, oportunidades, import gate, cookies/CSRF, RLS/RBAC, logout y redirect protegido. Revisar logs sin 5xx ni secretos.

## Aceptación y promoción

- Demo y Staging reciben sólo fixtures o datos autorizados para su ambiente. No se promociona la base de Demo.
- Promover el mismo SHA/digest aprobado; no reconstruir desde una rama móvil sin registrar el artefacto resultante.
- Aceptación gerencial no equivale a CI, health o smoke técnico. D01–D04 y la conciliación del workbook vigente conservan su estado independiente.
- Producción requiere autorización explícita posterior, inventario actualizado, ventana, responsables, backup restaurable, plan de corte, conciliación y criterio de abortar.
- Un VPS único no ofrece alta disponibilidad. Mantener Railway/Vercel recuperables hasta cerrar observación y aceptación del nuevo origen.

## Copia consistente y corte

1. Bloquear nuevas escrituras en el origen o establecer una ventana con un solo escritor.
2. Capturar backup consistente del origen autorizado y registrar hora, tamaño, herramienta/versión y checksum fuera de Git.
3. Restaurar en la base destino vacía, ejecutar migraciones controladas y verificar checksums.
4. Conciliar por tenant: usuarios/memberships, oportunidades, line items, facturación, snapshots, visitas, alertas y auditoría; comparar conteos y totales comerciales definidos.
5. Ejecutar seguridad y smoke completos contra el destino antes de enrutar tráfico.
6. Habilitar un único escritor en el destino y observar.

Antes de nuevas escrituras, volver al origen puede ser un rollback. Después de nuevas escrituras, cambiar DNS al origen antiguo perdería/dividiría datos: se debe detener escritura, conciliar el delta y restaurar o avanzar de forma controlada. DNS por sí solo no es rollback de datos.

## Backup y recuperación

Por ambiente, programar en un encargo posterior backups PostgreSQL hacia el destino autorizado, con cifrado, retención y alertas. No reutilizar como evidencia los restores de otro producto.

Drill mínimo:

1. `pg_dump -Fc` sobre una base sintética consistente.
2. Crear otra base desechable.
3. `pg_restore --no-owner` con el owner previsto.
4. Verificar las ocho migraciones/checksums, centinelas, conteos, 25 tablas con RLS forzado, rol runtime sin privilegios elevados y acceso tenant-scoped.
5. Ejecutar health/login/dashboard y eliminar sólo la base desechable creada por el drill.

Evidencia G21: PostgreSQL 18.4 ARM64 nativo aplicó primero 4 migraciones, preservó el centinela al avanzar a 8, validó checksums y restauró 8/8 migraciones, el centinela, 40 oportunidades sintéticas y acceso runtime tenant-scoped. El stack web/API/db pasó HTTPS local, cookies seguras, CSRF, dashboard, logout y redirect; no hubo HTTP 5xx inesperados. El cross-build AMD64 local aprobó para API y web; OVH no recibió esas imágenes.

## Acceso UAT local sin exposición

Las seis credenciales del staging Railway/Vercel son distintas de las cuentas sintéticas locales y de OVH. El archivo autorizado permanece en `$HOME/.config/sales-intelligence-platform/uat-credentials.txt` con directorio 0700 y fichero 0600. Para copiar sólo la contraseña de una cuenta numerada del 1 al 6:

```bash
SIP_UAT_ACCOUNT_INDEX=1 ./scripts/copy-uat-password.sh
```

El helper no imprime la contraseña, usa `pbcopy` y limpia el portapapeles después de 60 segundos si su contenido no fue reemplazado. El TTL puede reducirse con `SIP_CLIPBOARD_TTL_SECONDS`; nunca se debe pegar el secreto en terminal, GitHub, Notion o este runbook.

## Límites que siguen requiriendo una decisión posterior

- go-live, datos reales o cuentas de Edgar en Producción;
- merge a `staging` o `main` y cambio del origen Railway/Vercel estable;
- compra o ampliación de plan/capacidad;
- corte del escritor, conciliación comercial y cambio de DNS productivo;
- retirada de Railway/Vercel sólo después de aceptación.

## Registro G23

Fecha de ejecución: 2026-10-13. No se registran secretos, cookies, cadenas de conexión ni hashes de contraseñas.

### Código, CI y artefactos

- G20 quedó publicado en `feat/manager-dashboard-edgar` con HEAD local/remoto `eadc24080b1b90e0b1759fbefc63c098eaedf9cb`; PR #29 sigue abierto y sin merge.
- G21 quedó publicado en `chore/coolify-ovh-readiness` con HEAD de aplicación/despliegue `3daaf401ecd6a4885731d48234c73e4a4bb8d883`; PR #31 es apilado sobre G20 y no cambia `staging` ni `main`.
- CI de `3daaf401`: Quality `38463878945`/`115525702422` y Secret scan `115525702846`, ambos `SUCCESS`; Preview Vercel `SUCCESS` build-only.
- API AMD64: `sha256:70fd2d6a5ba23840035860f54e6414a8c90e1fdbc84d6cbe2072894a8ac5664b`.
- Web AMD64: `sha256:a1e842b3458e508846db3b21d02d1cdcef226443d31c9150a747cebbc0afd475`.
- Ambas imágenes tienen arquitectura `amd64` y etiqueta OCI `org.opencontainers.image.revision=3daaf401...`; el historial inspeccionado no contiene passwords, tokens, secretos ni URLs de base. Se transfirieron fuera del VPS y Coolify usa `SIP_IMAGE_PULL_POLICY=never`.
- PostgreSQL remoto: 18.4 AMD64, imagen/ID fijado `sha256:9a8afca54e7861fd90fab5fdf4c42477a6b1cb7d293595148e674e0a3181de15`.

Verificación del SHA desplegado: frozen install, formato, lint, tipos, build, 91 unitarias, 28 integraciones, 5 de aislamiento tenant, 10 E2E locales y Gitleaks sobre 101 commits. PostgreSQL 18.4 aplicó 8 migraciones; 25 tablas tienen RLS forzado. `pnpm audit --audit-level high` permanece `FAIL` por el `braces` tooling ya registrado (1 high, 2 moderate, 1 low; 0 critical), mientras `pnpm security:audit` devuelve `PASS_WITH_TIME_LIMITED_EXCEPTION` exclusivamente para `SIP-SEC-EXC-2026-001`, revisión 2026-10-19T16:59:59Z y expiración 2026-10-26T16:59:59Z. No se amplió ni renovó la excepción.

### Recursos Coolify creados

Proyecto `Sales Intelligence Platform`: `tw7eg2r5kncapwwwzraxyigw`.

| Ambiente   | Environment UUID           | Service UUID               | Estado 2026-10-13 | Dominio público                       | Datos                                  |
| ---------- | -------------------------- | -------------------------- | ----------------- | ------------------------------------- | -------------------------------------- |
| Demo       | `hvigp4mtz3dj9edmly3kf1qy` | `w9sfzwnotc47qq2qe5qrpm6z` | `running:healthy` | `https://demo.sales.syntavera.dev`    | 100% sintéticos                        |
| Staging    | `ktjnxd2aowocbkwomgftvoy3` | `v0k6gw5fvn8vjzft3v99uf0y` | `running:healthy` | `https://staging.sales.syntavera.dev` | 100% sintéticos                        |
| Producción | `qydftfgqu7a7gu7zoysknr2i` | `2iyl3kboglq5odrvpwk45qad` | `exited`/STOPPED  | ninguno                               | base no iniciada, sin seed ni usuarios |

Demo y Staging usan bases, roles owner/runtime, secretos, volúmenes y redes distintos. Ningún contenedor publica 4000/5432 ni monta el socket Docker. API y web son no-root, rootfs read-only y `cap_drop: ALL`; las bases no tienen bindings de puertos host. Los volúmenes observados son `w9sfzwnotc47qq2qe5qrpm6z_postgres-data` y `v0k6gw5fvn8vjzft3v99uf0y_postgres-data`. Producción tiene configuración y secretos propios, pero no creó contenedores, volumen ni ruta pública. Los tres servicios tienen `instant_deploy=false`.

Los dos dominios publicados ya estaban cubiertos por el wildcard DNS verificado de `syntavera.dev`; no fue necesario escribir ni sobrescribir registros. Traefik emitió certificados Let's Encrypt válidos, fuerza HTTPS y añade `X-Robots-Tag: noindex, nofollow`. `sales.syntavera.dev` permanece reservado y no enrutado.

### Verificación funcional y de seguridad remota

Demo:

- `/login`, `/api/health`, `/backend/health/live` y `/backend/health/ready`: HTTP 200 con TLS verificado.
- E2E remoto sin reintentos: 6 aprobados y 4 omitidos al no inyectar credenciales opcionales en esa corrida.
- Smoke adicional con Manager: login, resumen, marcas, pipeline, forecast, backlog, facturado, visitas, embudo, regla 4:1, alertas, drill-down, drawer y rutas de oportunidades/forecast/alertas; cero errores de consola y cero HTTP 5xx.

Staging:

- `/login`, `/api/health`, `/backend/health/live` y `/backend/health/ready`: HTTP 200 con TLS verificado.
- Perfiles sintéticos activos: Tenant Admin, Manager A, Manager B, Seller, Executive y Viewer. Los tres sellers están divididos entre ambos managers; Manager B observó 26 oportunidades dentro de su ámbito.
- E2E remoto sin reintentos: 9/9 para login/i18n/tema/mobile/admin/Manager A/Seller/import gate/Copilot y 1/1 para Executive+Viewer read-only.
- Auth/CSRF: sesión `Secure`, `HttpOnly`, `SameSite=Lax`; mutación sin cabecera CSRF devolvió 403; logout y redirect protegido aprobados.
- RLS/RBAC: runtime `sip_runtime_staging` es login miembro de `app_runtime`, sin superusuario ni `BYPASSRLS`; 25 tablas `FORCE RLS`. Un tenant desechable dentro de transacción mostró 15 filas propias, 0 filas cruzadas y 1 fila propia del segundo tenant; la escritura cruzada falló con SQLSTATE 42501 y la transacción se revirtió.
- Import semanal sintético: lote `PUBLISHED`, 1/1 oportunidad procesada desde CSV, fuente `WORKBOOK_IMPORT`, persistencia por endpoint y snapshot generado. La oportunidad produjo alerta HIGH `QUALIFICATION_INCOMPLETE`; el botón de inspección abrió su drawer con respuestas 200 del detalle y la calificación, y el dashboard permaneció operativo. Un lote sintético anterior sin manager válido quedó `PARTIAL`/rechazado, sin disfrazar el fallo ni convertir nulos en cero.
- Contratos comerciales remotos tenant-wide: cuota 2,2 M, margen 7,017%, backlog 468 k, cobertura 4:1 `INSUFFICIENT`, visitas 1 Sí/2 No, 3 marcas, 3 sellers y 22 alertas. La base contiene seis oportunidades etapa 90 con backlog residual positivo entre 54 k y 309 k; confirma facturación parcial sin convertir el saldo a cero.

### Backup y restauración

Backups específicos de SIP quedaron en `/var/backups/sales-intelligence-platform/g23`, propiedad de root y modo 0600. No dependen del backup del panel Coolify y contienen sólo datos sintéticos:

| Ambiente |       Tamaño | SHA-256                                                            | Restore real en base desechable           |
| -------- | -----------: | ------------------------------------------------------------------ | ----------------------------------------- |
| Demo     | 168847 bytes | `5632b1c58fdbe78e2a6fc9eca9e8fb76940ccb0bd309333fdb9d4f1c5c173d6e` | 8 migraciones, 1 tenant, 41 oportunidades |
| Staging  | 176648 bytes | `2c03dbcb4e996d7bb49b5546ece91be256617419e1ec9ea77da4005b43fc2793` | 8 migraciones, 1 tenant, 42 oportunidades |

Ambas restauraciones usaron `pg_restore --no-owner --no-privileges`; las bases desechables creadas por el drill se eliminaron después de validar. Estos archivos residen en el mismo VPS: demuestran recuperabilidad lógica, no backup off-site, retención programada ni alta disponibilidad. Producción detenida conserva el procedimiento definido, pero no se generó un dump vacío artificial.

### Capacidad y no regresión de vecinos

Preflight: 11 GiB RAM, 5,2 GiB disponibles, 48 GiB de disco libres, 24 contenedores activos. Tras Demo+Staging: 4,9 GiB RAM disponibles, 46 GiB libres, 16% de inodos y 30 contenedores activos. Los seis contenedores SIP medidos consumieron aproximadamente 484 MiB; los límites Compose siguen siendo el techo, no memoria reservada real. No se ejecutaron builds pesadas, `prune`, stress, cambios globales de Docker/Traefik/Coolify/firewall ni apagados de terceros.

SyntaVera producción/staging y EIA Demo/Staging permanecieron `running:healthy`; sus rutas públicas respondieron sin error TLS. Railway staging conserva deploy `188246ae-35e7-40d9-8f3c-f02907b312f8` `SUCCESS` sobre `2714700911293de14429f6851963168a929c0bf7`. Vercel conserva deployment `dpl_5RU78doZMer6avmBJLomccgwaFEZ` `READY` sobre el mismo SHA. `origin/staging` y `main` no cambiaron. No se trasladó información real de Edgar y no se conectó ninguna base Railway.

### Estado posterior

Demo y Staging están disponibles para revisión sintética; Producción está preparada pero no está LIVE. D01-D04, la conciliación del workbook vigente y H3 continúan pendientes/no iniciados. Antes de datos reales o go-live se requiere una decisión separada sobre fuente de verdad, consentimiento, ventana de un solo escritor, backup off-site/retención, conciliación comercial, corte y rollback.
