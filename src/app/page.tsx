import Link from "next/link";
import { Button, FancyButton } from "@biaenergy/ui";
import { getCurrentUser } from "@/auth/currentUser";
import { Oli, OliNombre } from "@/modules/shell/components/Oli";
import { ChatOli } from "@/modules/oli/components/Chat";
import { Pestanas, type Seccion } from "@/modules/landing/components/Pestanas";
import { Tarjeta } from "@/modules/landing/components/Tarjeta";
import { CtaOlibia } from "@/modules/landing/components/CtaOlibia";
import {
  getAportes,
  getEmbalses,
  getPrecioBolsa,
} from "@/modules/landing/data/mercadoAbierto";

/**
 * La portada: un tablero con datos reales, no un folleto.
 *
 * Quien llega ve el mercado antes de que le pidamos nada, y puede
 * preguntarle a Oli sobre lo que está viendo. El registro aparece cuando la
 * pregunta se vuelve sobre SU empresa — después de mostrar valor, no antes de
 * dejar ver nada.
 *
 * No redirige aunque haya sesión: es la cara del producto y tiene que poder
 * verse. Antes mandaba directo a /chat y era invisible para cualquiera que ya
 * hubiera entrado una vez.
 */
const SUGERENCIAS = [
  "¿Cómo van los embalses del país?",
  "¿Qué pasó con el precio de bolsa este mes?",
  "¿Cómo está mi empresa frente a su mercado?",
] as const;

const HomePage = async () => {
  const user = await getCurrentUser();

  // En paralelo: son tres llamadas independientes y encadenarlas triplicaría
  // el tiempo hasta el primer pixel de la portada.
  const [embalses, aportes, precio] = await Promise.all([
    getEmbalses(),
    getAportes(),
    getPrecioBolsa(),
  ]);

  const secciones: Seccion[] = [
    {
      id: "hidrologia",
      label: "Generación e hidrología",
      contenido: (
        <div className="grid gap-4 lg:grid-cols-2">
          <Tarjeta
            titulo="Nivel de embalses del SIN"
            subtitulo="Volumen útil del sistema"
            unidad="%"
            puntos={embalses}
            lectura="El embalse agregado es el driver de primer orden del precio de bolsa: cuando baja, el sistema despacha más térmica y el spot sube."
            accionOlibia="Con Olibia puedes cubrir tu exposición antes de que el spot reaccione."
          />
          <Tarjeta
            titulo="Aportes hídricos"
            subtitulo="Frente a la media histórica"
            unidad="%"
            puntos={aportes}
            lectura="Los aportes son mucho más volátiles que el nivel: son el indicador líder. Un embalse alto con aportes bajos significa que el sistema está gastando el ahorro, no reponiéndolo."
            accionOlibia="Olibia monitorea esto y te avisa antes de que se vuelva un problema."
          />
        </div>
      ),
    },
    {
      id: "bolsa",
      label: "Precio de bolsa",
      contenido: (
        <div className="grid gap-4 lg:grid-cols-2">
          <Tarjeta
            titulo="Precio de bolsa"
            subtitulo="Promedio diario del SIN"
            unidad="COP/kWh"
            puntos={precio}
            lectura="El precio spot es lo que pagas por la energía que no tienes contratada. Cada punto de cobertura que te falta se convierte en exposición a esta curva."
            accionOlibia="Con Olibia gestionas tu portafolio de contratos contra esta curva."
          />
        </div>
      ),
    },
    {
      // "Tarifas" y no "Tu competitividad": acá todavía no sabemos quién es
      // esta persona ni en qué mercado opera. Hablarle de "tu" posición antes
      // de que se identifique promete algo que la pantalla no puede cumplir.
      id: "tarifas",
      label: "Tarifas",
      contenido: (
        <div className="border-stroke-soft-200 flex flex-col items-start gap-4 rounded-2xl border border-dashed p-8">
          <h3 className="text-label-md text-text-strong-950">
            Ranking de tarifas por mercado
          </h3>
          <p className="text-paragraph-sm text-text-sub-600 max-w-xl">
            El costo unitario de cada comercializador y operador de red, mercado
            por mercado, con el desglose de los seis componentes CREG:
            generación, comercialización, transporte, distribución, pérdidas y
            restricciones. Y la cobertura contratada de cada agente.
          </p>
          <p className="text-paragraph-sm text-text-sub-600 max-w-xl">
            Son datos públicos, pero identifican a cada empresa por su nombre.
            Por eso pedimos una cuenta: para saber quién los consulta.
          </p>
          <p className="text-paragraph-xs text-text-soft-400 max-w-xl">
            Al crearla nos dices en qué mercado operas, y entonces sí podemos
            mostrarte tu posición frente a los demás.
          </p>
          <FancyButton.Root variant="primary" asChild size="small">
            <Link href="/registro">Crear cuenta gratis</Link>
          </FancyButton.Root>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="border-stroke-soft-200 bg-bg-white-0 sticky top-0 z-10 border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <span className="text-label-md text-text-strong-950">
            Olibia Utility Intelligence
          </span>
          {user === null ? (
            <div className="flex items-center gap-2">
              <Button.Root asChild variant="neutral" mode="ghost" size="xsmall">
                <Link href="/ingresar">Ingresar</Link>
              </Button.Root>
              <FancyButton.Root variant="primary" asChild size="xsmall">
                <Link href="/registro">Crear cuenta</Link>
              </FancyButton.Root>
            </div>
          ) : (
            <FancyButton.Root variant="primary" asChild size="xsmall">
              <Link href="/chat">Entrar a Oli</Link>
            </FancyButton.Root>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-14">
        <section className="flex flex-col items-center gap-7">
          <Oli size="lg" />
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-title-h3 text-text-strong-950 max-w-2xl text-balance">
              Hola, soy <OliNombre />. ¿Qué quieres saber del mercado eléctrico?
            </h1>
            <p className="text-paragraph-lg text-text-sub-600 max-w-xl">
              Precio de bolsa, embalses, generación y tarifas de Colombia.
              Pregúntame sin crear cuenta.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <ChatOli sugerencias={SUGERENCIAS} conSesion={user !== null} />
          </div>
        </section>

        <Pestanas secciones={secciones} />

        <CtaOlibia variante="cierre" />

        <p className="text-paragraph-xs text-text-soft-400 border-stroke-soft-200 border-t pt-6 text-center">
          El mercado mayorista —precio de bolsa, demanda, generación y embalses—
          viene de XM. Las tarifas las publica cada comercializador y cada
          operador de red por metodología CREG. No mostramos proyecciones.
        </p>
      </main>
    </>
  );
};

export default HomePage;
