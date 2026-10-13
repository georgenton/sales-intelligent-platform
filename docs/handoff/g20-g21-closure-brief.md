# Encargo saneado G20 → G21

Fecha de recepción: 2026-10-13.

Este handoff conserva el alcance operativo del encargo sin copiar transcript, imágenes privadas, workbook, credenciales, cookies, tokens ni cadenas de conexión.

## G20

- Continuar el mismo PR/branch funcional `feat/manager-dashboard-edgar`, preservando la base estable y el worktree de seguridad.
- Corregir horizonte de facturación, fórmula reciente Forecast + Backlog, base 4:1, backlog parcial, margen, cuota explícita de línea, pertenencia mínima de equipo, visitas, serie semanal y alertas A01–A07.
- Mantener D01–D04 honestos y no representar fixtures como aceptación comercial.
- Verificar desde datos persistidos hasta pantalla con perfiles sintéticos, RLS, E2E, responsive, idiomas, temas, accesibilidad y capturas locales.
- Crear sólo commits locales; sin push, merge o despliegue.

## G21

- Crear/reutilizar el worktree `chore/coolify-ovh-readiness` desde el SHA final exacto de G20.
- Realizar inventario remoto sólo con acceso READ ya autorizado; si no existe, marcarlo no verificado y continuar localmente.
- Completar empaquetado web/API/PostgreSQL para la ruta HTTPS/Traefik → Next → `/backend` → Nest → PostgreSQL, con sólo web público.
- Separar Demo, Staging y Producción por configuración, base, credenciales, red y volumen; proponer recursos/dominios sin crearlos.
- Ensayar PostgreSQL 18 local, roles admin/runtime, RLS/grants/checksums, migración incremental, backup y restore real en otra base desechable.
- Escribir un único runbook `docs/deployment/ovh-coolify.md` con publicación, aceptación, promoción, corte, conciliación y recuperación.
- Sin push, registry remoto, Coolify/Railway/Vercel, DNS, datos reales, backups ajenos o rotaciones.

## Seguridad y entrega

- Conservar G17 y `SIP-SEC-EXC-2026-001` sin renovar ni alterar su alcance.
- Mantener `AUDIT_RAW` separado de `SECURITY_POLICY` y fallar cerrado ante hallazgos fuera de la excepción.
- Revisar diff y Gitleaks antes de cada commit publicable.
- Actualizar producto, auditoría, handoff y las páginas de memoria mediante lectura previa; no marcar trabajo futuro como realizado.
