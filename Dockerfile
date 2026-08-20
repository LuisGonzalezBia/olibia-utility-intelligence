# Imagen de produccion de Olibia Utility Intelligence.
#
# Construir:
#   docker build --secret id=npm_token,env=NPM_GITHUB_TOKEN -t olibia-ui:latest .
#
# Ejecutar:
#   docker run -p 3000:3000 \
#     -e BACKEND_URL=https://... -e OLIBIA_ANTHROPIC_API_KEY=... \
#     olibia-ui:latest
#
# Las variables se leen en RUNTIME, no en build: la app las consume desde
# Server Components y route handlers, nunca desde el bundle del navegador. Por
# eso la misma imagen sirve para staging y produccion, y por eso ninguna clave
# queda dentro de una capa.

# --------------------------------------------------------------------------
# deps — solo instalar. Se separa del build para que un cambio de codigo no
# invalide la capa de npm ci, que es la lenta.
# --------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json .npmrc ./

# El token del registro de GitHub. Dos caminos, y se prefiere el seguro:
#
#   1. Secreto de BuildKit (`--secret id=npm_token`). Se monta solo durante
#      este RUN y no toca ninguna capa. Es lo que usa nuestro CI.
#   2. Build arg `NPM_TOKEN`, que es como Cactus inyecta credenciales de build
#      (pestana "Docker arguments"), igual que olibia-web. Un build arg queda
#      en la historia de SU etapa; esta etapa se descarta, porque en multi-stage
#      solo viajan las capas de la ultima y `runner` no hereda nada de `deps`
#      salvo los archivos que se copian explicitamente.
#
# Si el secreto esta montado, gana; si no, se cae al arg. Asi el mismo
# Dockerfile sirve para el CI y para la plataforma.
ARG NPM_TOKEN=""
RUN --mount=type=secret,id=npm_token,required=false \
    NPM_GITHUB_TOKEN="$( [ -s /run/secrets/npm_token ] && cat /run/secrets/npm_token || printf %s "$NPM_TOKEN" )" \
    npm ci

# Nota: `--mount=type=secret` exige BuildKit. Lo traen por defecto Docker 23+ y
# cualquier constructor moderno. Si la plataforma corriera con el constructor
# viejo, la linea de arriba no parsea; el reemplazo es dejar solo el arg:
#   RUN NPM_GITHUB_TOKEN="$NPM_TOKEN" npm ci

# --------------------------------------------------------------------------
# build
# --------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# --------------------------------------------------------------------------
# runner — solo el standalone. Sin npm, sin fuentes, sin node_modules completo.
# --------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache wget

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario sin privilegios: si algo logra ejecutar codigo en el contenedor, que
# no lo haga como root.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# `standalone` no incluye los estaticos ni public: van copiados aparte.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
