# OVH/Coolify — publicación de Sales Intelligence Platform

Estado de este documento: paquete G21 ensayado localmente y ejecución G23 autorizada el 2026-10-13. La sección "Registro G23" se completa sólo con evidencia observada del despliegue remoto.

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

Esta sección se actualiza al terminar Demo, Staging, restore remoto y preparación protegida de Producción. No registrar secretos, cookies, cadenas de conexión ni hashes de contraseñas.
