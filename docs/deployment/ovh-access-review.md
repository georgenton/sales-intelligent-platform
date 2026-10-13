# Revisión personal de Sales Intelligence en OVH

Esta guía permite a Jorge recorrer los tres ambientes en menos de diez minutos. Todas las cuentas son sintéticas. Nunca copies el archivo completo de credenciales ni lo compartas por chat, PR, captura o Notion.

## Preparación segura en el Mac

Las credenciales están fuera del repositorio, en `~/.config/sales-intelligence-platform/ovh/`. El directorio debe tener modo `0700` y cada `*-access.env`, modo `0600`. El helper valida esos permisos, copia una sola contraseña con `pbcopy`, no la imprime y limpia el portapapeles después de 60 segundos si su contenido no cambió:

```bash
./scripts/copy-ovh-access-secret.sh <ambiente> <cuenta>
```

Se puede ajustar el TTL sólo para una ejecución, por ejemplo `SIP_CLIPBOARD_TTL_SECONDS=30`. No usar un TTL largo en equipos compartidos.

## Recorrido

### 1. Demo

- URL: `https://demo.sales.syntavera.dev`
- Archivo local: `~/.config/sales-intelligence-platform/ovh/demo-access.env`
- Manager: `manager@techdistribution.demo`
- Seller: `sofia@techdistribution.demo`
- Viewer: `viewer@techdistribution.demo`

Ejemplo para Manager:

```bash
./scripts/copy-ovh-access-secret.sh demo manager
```

Abrir resumen, forecast/pipeline, alertas, un drill-down y un drawer. Cerrar sesión y confirmar que `/app/dashboard` vuelve a `/login`.

### 2. Staging OVH

- URL: `https://staging.sales.syntavera.dev`
- Archivo local: `~/.config/sales-intelligence-platform/ovh/staging-access.env`
- Tenant Admin: `admin@techdistribution.demo`
- Manager: `manager@techdistribution.demo`
- Seller: `sofia@techdistribution.demo`
- Viewer: `viewer@techdistribution.demo`

```bash
./scripts/copy-ovh-access-secret.sh staging admin
./scripts/copy-ovh-access-secret.sh staging manager
./scripts/copy-ovh-access-secret.sh staging seller
./scripts/copy-ovh-access-secret.sh staging viewer
```

Usar Tenant Admin para revisar importación sintética, idioma y tema; no ejecutar archivos reales. Con Seller revisar visitas y los modos Standard/Focus/Guided. Con Manager revisar resumen, alertas y drill-down. Cerrar sesión en cada perfil.

### 3. Producción privada — no LIVE

- URL temporal: `https://preprod.sales.syntavera.dev`
- Archivo local: `~/.config/sales-intelligence-platform/ovh/production-access.env`
- Perímetro Basic Auth: usuario `jorge-sip-review`
- App Manager: `manager@techdistribution.demo`
- App Viewer: `viewer@techdistribution.demo`

Primero copiar la clave de perímetro y completar el diálogo del navegador:

```bash
./scripts/copy-ovh-access-secret.sh production edge
```

Después copiar la contraseña de la app para el perfil elegido:

```bash
./scripts/copy-ovh-access-secret.sh production manager
# o
./scripts/copy-ovh-access-secret.sh production viewer
```

Confirmar el rótulo `PRUEBA — NO PRODUCCIÓN COMERCIAL`, revisar resumen/alertas/drill-down y cerrar sesión. Esta URL no contiene datos reales, no usa `sales.syntavera.dev` y no autoriza go-live, importación de Edgar ni creación de usuarios comerciales.

## Si un acceso falla

1. Confirmar que la URL corresponde al archivo local del mismo ambiente.
2. Volver a copiar sólo la cuenta necesaria con el helper; no abrir ni pegar el archivo completo.
3. En Producción privada distinguir el 401 de Traefik (diálogo Basic Auth) del mensaje de login de la aplicación.
4. No bajar rate limits ni reutilizar credenciales de Railway/Vercel. Reportar ambiente, perfil, hora y código HTTP, nunca la contraseña.
