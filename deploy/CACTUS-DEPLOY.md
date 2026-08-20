# Desplegar Olibia Utility Intelligence en Cactus

Se configura como **Frontend**, igual que `olibia-web`: Cactus clona el repo y
construye el Dockerfile él mismo. No hay que publicar una imagen a ningún lado.

## 0. Requisito previo: mover el repo a la org

Hoy está en `github.com/LuisGonzalezBia/olibia-utility-intelligence`. Cactus
clona por SSH con la llave de despliegue de `biaenergy` (`olibia-web` apunta a
`git@github.com:biaenergy/olibia-web.git`), así que desde una cuenta personal
**no va a poder clonar**.

Mover el repo a `biaenergy/olibia-utility-intelligence` resuelve eso y, de paso,
el acceso a `@biaenergy/ui`, que vive en los paquetes de esa misma org.

## 1. Global Configuration

| Campo | Valor |
|---|---|
| Name | `olibia-utility-intelligence` |
| DNS record | `utility-olibia` |
| Repository | `git@github.com:biaenergy/olibia-utility-intelligence.git` |
| Content type | **Dynamic (Server Side Render)** |
| Build | `Dockerfile` |
| Dockerfile | *(vacío — toma el de la raíz)* |
| Port | `3000` |
| Health check path | `/health` |
| Health check status code | `200` |

Dos diferencias con olibia-web, ambas a propósito:

- **`/health` y no `/`.** Existe la ruta y no toca el backend: devuelve `ok` sin
  llamar a nada. La portada (`/`) también daría 200, pero dispara tres llamadas
  al backend en cada sondeo, y si status-bia se cae, Cactus reciclaría el
  contenedor en loop por un problema ajeno.
- **`Content type` en Dynamic**, no estático: la app es Next con Server
  Components y route handlers (`/api/oli`, `/api/login`). Un export estático no
  serviría.

## 2. Docker arguments

| Key | Value |
|---|---|
| `NPM_TOKEN` | PAT con `read:packages` sobre `biaenergy` |

Es el mismo mecanismo y el mismo nombre que usa olibia-web. Sirve para instalar
`@biaenergy/ui`. El Dockerfile lo consume solo en la etapa `deps`, que se
descarta: en multi-stage únicamente viajan las capas de la última etapa, así que
el token no queda en la imagen publicada.

## 3. Environment variables

Solo una, mas el secreto de abajo:

```env
BACKEND_URL=https://olibia.bia.app
```

`NODE_ENV`, `PORT` y `HOSTNAME` **no van aca**: ya quedan fijadas dentro de la
imagen (ver el Dockerfile). Repetirlas no rompe nada, pero es ruido.

`BACKEND_URL` es **solo el origen**. El resto de la ruta
(`/ms-bia-growth-status/public-ms/utility-intelligence`) la agrega
`src/backend/client.ts`; ponerla acá la duplica y todo responde 404.

Y el secreto:

```env
OLIBIA_ANTHROPIC_API_KEY=...
```

Aparte de la de Bia a propósito: son dos audiencias distintas —empleados vs.
agentes del sector, que compiten entre sí— y una sola key mezcla consumo, rate
limit y facturación. Sin ella la app funciona igual; solo se apaga el chat
(`/api/oli` responde 503 y el front muestra su mensaje).

Opcional: `OLI_MODEL` (el código ya trae default).

## 4. Runtime settings

Los mismos de olibia-web:

| Campo | Valor |
|---|---|
| Cpu units | `256` (.25 vCPU) |
| Memory | `512 MB` |
| Min / Max instances | `1` / `1` |
| Health check grace period | `30` |
| Auto scaling | `False` |
| Spot instance percentage | `0%` |

Si el contenedor se reinicia solo bajo carga, lo primero a subir es **Memory**:
Next SSR con el design system pesa más en RAM que en CPU.

## 5. Policies

`ingress-proxy`, para que quede expuesto por el ingress. La de S3 de olibia-web
no aplica: esta app no escribe archivos.

## 6. Orden de despliegue

Primero **bia-growth-status-back#296**. Hoy en producción `/abierto/enso` y
`/abierto/demanda-yoy` responden 404 y `/abierto/generacion-mix` responde 500,
así que las gráficas de ENSO y de demanda no funcionan hasta que ese esté
arriba.

## 7. Smoke post-deploy

```bash
BASE=https://utility-olibia.<dominio>

curl -s $BASE/health                                     # → ok
curl -s -o /dev/null -w '%{http_code}\n' $BASE/          # → 200
curl -s -o /dev/null -w '%{http_code}\n' $BASE/registro  # → 200
```

La prueba que de verdad importa es **abrir `/` en un navegador**. La portada
degrada en vez de caerse, así que si `BACKEND_URL` está mal igual da 200: lo que
se ve es que las pestañas salen vacías.

Después, un registro real de punta a punta — es el primer camino que cruza
front, backend y correo de verificación, y nunca se ha corrido contra un backend
desplegado (en local `BACKEND_URL` apunta a `localhost:8081`).

## 8. Errores típicos

| Síntoma | Causa probable |
|---|---|
| Cactus no puede clonar | El repo sigue en la cuenta personal (§0) |
| El build falla en `npm ci` con 401/403 | `NPM_TOKEN` vencido o sin `read:packages` sobre `biaenergy`. Los PAT fine-grained vencen a los 90 días. |
| La portada carga pero las pestañas salen vacías | `BACKEND_URL` mal, o el back sin desplegar |
| `/api/oli` devuelve 503 | Falta `OLIBIA_ANTHROPIC_API_KEY`. Solo se apaga el chat. |
| No pasa el health check | El puerto no es 3000, o el path quedó en `/` con el backend caído |
| El build falla parseando el `RUN --mount` | El constructor de la plataforma no tiene BuildKit. Reemplazar esa línea del Dockerfile por `RUN NPM_GITHUB_TOKEN="$NPM_TOKEN" npm ci` (está comentado ahí mismo). |
