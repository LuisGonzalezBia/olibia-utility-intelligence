# Desplegar Olibia Utility Intelligence en Cactus

Sigue la guía estándar de Bia (`DEPLOY_GUIDE_OLIBIA_CACTUS.md`). Acá están solo
las decisiones propias de este servicio, y las tres que hay que tomar antes de
apretar el botón.

## 0. Lo que hay que decidir primero

### El hostname no puede ser `internal.bia.app/<prefijo>`

Los microservicios de la casa se montan bajo un path (`/ms-mcp`, `/ms-bia-growth-status`).
Acá eso no sirve, por dos razones distintas:

1. **Es un producto público.** Los usuarios son agentes del sector energético,
   no empleados de Bia. `internal.bia.app` es de la red interna.
2. **Next hornea el `basePath` en el build.** No es una variable de runtime:
   si el servicio vive bajo `/ms-oui`, hay que reconstruir la imagen con ese
   prefijo, y deja de ser la misma imagen para staging y producción. Además
   `/health` se movería a `/ms-oui/health` y el liveness de Cactus —que sondea
   la raíz sin conocer el prefijo— empezaría a fallar.

**Pedirle a plataforma un hostname propio** y montar la app en la raíz. Algo
como `utility.olibia.energy` o `intelligence.bia.app`. Con eso no hace falta
`basePath`, `/health` queda donde Cactus lo espera y la imagen es una sola.

### El repo está en una cuenta personal

Hoy es `github.com/LuisGonzalezBia/olibia-utility-intelligence`. Dos
consecuencias:

- La imagen sale a `ghcr.io/luisgonzalezbia/olibia-utility-intelligence`, no
  bajo `biaenergy`.
- `@biaenergy/ui` vive en el registro de paquetes de la org `biaenergy`, así que
  el `GITHUB_TOKEN` del workflow **no alcanza** para instalarlo. Por eso el
  build usa el secreto `NPM_GITHUB_TOKEN` (ver abajo).

Moverlo a `biaenergy/` resuelve las dos de una y alinea permisos con el resto.
Mientras tanto funciona con el PAT.

### El front nunca habló con un backend desplegado

En local `BACKEND_URL` apunta a `http://localhost:8081`. La primera corrida en
staging es también la primera prueba real de esa integración — no la programes
para el mismo día de una demo.

## 1. Naming sugerido

**MS Name (Cactus UI):** `ms-olibia-utility-intelligence`

Con hostname propio y sin prefijo de path, el nombre solo identifica el
deployment; no entra en ninguna URL.

## 2. Requisitos previos

| Qué | Dónde | Para qué |
|---|---|---|
| Secreto `NPM_GITHUB_TOKEN` | Settings → Secrets → Actions **del repo** | Instalar `@biaenergy/ui` en CI y en el build de la imagen. PAT fine-grained, `Packages: Read` sobre `biaenergy`. **Vence a los 90 días** y cuando vence rompe todos los builds. |
| Image pull secret de GHCR | Namespace de Cactus | La imagen es privada. |
| Backend desplegado | bia-growth-status-back | Ver §6. |

## 3. Tag a desplegar

```bash
git tag v0.1.0 && git push --tags
```

El workflow `build-image.yml` construye y publica con ese tag. Ojo: el repo
tiene `protect-tags.yml`, que bloquea tags fuera del proceso — coordinar con
plataforma si lo rechaza.

## 4. Variables de entorno

Ninguna de estas llega al navegador: la app las consume desde Server Components
y route handlers. Por eso la misma imagen sirve para staging y producción.

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# SOLO el origen del gateway. El resto de la ruta
# (/ms-bia-growth-status/public-ms/utility-intelligence) la pone el cliente en
# src/backend/client.ts, asi que ponerla aca la duplica y todo da 404.
#
# El backend NO es el MCP: es status-bia-back.
BACKEND_URL=https://olibia.bia.app
```

### Secretos (al secret manager, nunca al repo)

```env
# La key de Anthropic con la que responde Oli. Aparte de la de Bia a propósito:
# son dos audiencias distintas —empleados vs. agentes del sector, que compiten
# entre sí— y una sola key mezcla consumo, rate limit y facturación.
OLIBIA_ANTHROPIC_API_KEY=sk-ant-...
```

### Opcional

```env
OLI_MODEL=claude-sonnet-5   # default del código si no se setea
```

## 5. Imagen y probes

```
ghcr.io/luisgonzalezbia/olibia-utility-intelligence:v0.1.0
```

| Probe | Ruta | Esperado |
|---|---|---|
| Liveness | `GET /health` | 200 `ok` |

`/health` **no toca el backend a propósito**. Si dependiera de status-bia, una
caída suya haría que Cactus reciclara este contenedor en loop y la portada
—que sabe degradar sin datos— dejaría de servirse por un problema ajeno.

## 6. Dependencia del backend

Las gráficas de ENSO y de crecimiento de demanda **no funcionan** hasta que
`bia-growth-status-back#296` esté en producción: hoy `/abierto/enso` y
`/abierto/demanda-yoy` responden 404, y `/abierto/generacion-mix` responde 500.
Desplegar el back primero.

## 7. Smoke post-deploy

```bash
BASE=https://<hostname-asignado>

curl -s $BASE/health                     # → ok
curl -s -o /dev/null -w '%{http_code}\n' $BASE/          # → 200, con las gráficas pobladas
curl -s -o /dev/null -w '%{http_code}\n' $BASE/registro  # → 200
curl -s -o /dev/null -w '%{http_code}\n' $BASE/chat      # → redirige a /ingresar sin sesión
curl -s -X POST $BASE/api/oli -H 'content-type: application/json' -d '{}'
# → 503 "Oli todavía no está configurado" si falta la key; 400 si ya está
```

La prueba que de verdad importa es **abrir `/` en un navegador**: si las
pestañas de la portada salen vacías, `BACKEND_URL` está mal o el back no
responde. La página no se cae —degrada— así que el 200 solo no lo detecta.

## 8. Errores típicos

| Síntoma | Causa probable |
|---|---|
| El build de CI falla en `npm ci` con 401/403 | `NPM_GITHUB_TOKEN` vencido o sin `Packages: Read` sobre `biaenergy` |
| La portada carga pero las pestañas salen vacías | `BACKEND_URL` mal, o el back sin desplegar |
| `/api/oli` devuelve 503 "Oli todavía no está configurado" | Falta `OLIBIA_ANTHROPIC_API_KEY`. El resto de la app sigue funcionando: solo se apaga el chat. |
| CSS y JS dan 404 | Se montó bajo un path sin reconstruir con `basePath` (ver §0) |
| Liveness falla | Se montó bajo un prefijo: `/health` quedó en `/<prefijo>/health` |
