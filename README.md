# Olibia Utility Intelligence

Plataforma pública de inteligencia de mercado para agentes del sector energético
colombiano: competitividad tarifaria, ranking por mercado y análisis sobre datos
públicos (XM, SIMEM, tarifas publicadas).

Es una plataforma **aparte de Olibia**: comparte el design system y la
experiencia, pero tiene su propio padrón de usuarios (agentes del sector, no
empleados de Bia) y su propia autenticación — no pasa por el Firebase de Bia ni
por los roles de status-bia.

## Instalación

El design system `@biaenergy/ui` vive en GitHub Packages, así que hace falta un
token con scope `read:packages`. El `.npmrc` lo lee de una variable de entorno —
nunca se escribe el token en el archivo:

```bash
export NPM_GITHUB_TOKEN=$(gh auth token)   # o un PAT con read:packages
npm ci
```

```bash
npm run dev          # http://localhost:3000
npm run build        # build de producción
npm run type-check   # tsc --noEmit
npm run lint
```

## Sobre las dependencias

Tres decisiones deliberadas, todas por la misma razón: los ataques de cadena de
suministro en npm (gusanos tipo Shai-Hulud) entran por dependencias que nadie
eligió y se ejecutan al instalar.

**`ignore-scripts=true`.** Ningún paquete ejecuta código al instalarse. Es
exactamente la vía que usan esos gusanos: un `postinstall` que busca tokens en
el disco (`.npmrc`, credenciales de CI) y se republica solo. Del árbol actual
solo `unrs-resolver` traía `postinstall`, y se verificó que lint y build
funcionan igual sin ejecutarlo.

**Versiones exactas** (`save-exact=true`, sin `^`). Con rangos, un parche
comprometido de una dependencia entra solo en la próxima instalación. Actualizar
pasa a ser una decisión explícita y revisable en el diff.

**Set mínimo.** Cinco dependencias de runtime. Se agrega lo que haga falta
cuando haga falta, no por adelantado: cada paquete nuevo arrastra su propio
árbol y su propia superficie de ataque.

Antes de agregar una dependencia, conviene revisar si trae scripts de
instalación:

```bash
npm ls --all --json | grep -c .          # tamaño real del árbol
npm view <paquete> scripts               # ¿ejecuta algo al instalar?
```

## Versiones

Next.js 16, React 19, Tailwind 4 — alineadas con `olibia-web` para que el design
system se comporte igual en ambos.
