import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, FancyButton } from "@biaenergy/ui";
import { getCurrentUser } from "@/auth/currentUser";
import { Oli, OliNombre } from "@/modules/shell/components/Oli";
import { ChatOli } from "@/modules/oli/components/Chat";

/**
 * La portada es un tablero, no un folleto.
 *
 * Quien llega ve datos reales del mercado y puede preguntarle a Oli sobre lo
 * que está viendo, sin cuenta. Cuando la pregunta se vuelve sobre SU empresa,
 * Oli mismo lo invita a registrarse — el registro aparece después de haber
 * mostrado valor, no antes de dejar ver nada.
 *
 * Es lo contrario a una landing que promete: acá el usuario comprueba de qué
 * es capaz Oli antes de dar un correo.
 */
const SUGERENCIAS = [
  "¿Cómo van los embalses del país?",
  "¿Qué pasó con el precio de bolsa este mes?",
  "¿Quién generó más energía la semana pasada?",
  "¿Cómo está mi empresa frente a su mercado?",
] as const;

const HomePage = async () => {
  // Con sesión no tiene sentido la portada de entrada: va derecho a Oli.
  if ((await getCurrentUser()) !== null) redirect("/chat");

  return (
    <>
      <header className="border-stroke-soft-200 bg-bg-white-0 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <span className="text-label-md text-text-strong-950">
            Olibia Utility Intelligence
          </span>
          <div className="flex items-center gap-2">
            <Button.Root asChild variant="neutral" mode="ghost" size="xsmall">
              <Link href="/ingresar">Ingresar</Link>
            </Button.Root>
            <FancyButton.Root asChild size="xsmall">
              <Link href="/registro">Crear cuenta</Link>
            </FancyButton.Root>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-14">
        <Oli size="lg" />

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-title-h3 text-text-strong-950 text-balance">
            Hola, soy <OliNombre />. ¿Qué quieres saber del mercado eléctrico?
          </h1>
          <p className="text-paragraph-lg text-text-sub-600 max-w-xl">
            Precio de bolsa, embalses, generación y tarifas de Colombia.
            Pregúntame sin crear cuenta.
          </p>
        </div>

        <ChatOli sugerencias={SUGERENCIAS} conSesion={false} />

        {/* Honestidad de datos, igual que en el resto del producto. */}
        <p className="text-paragraph-xs text-text-soft-400 border-stroke-soft-200 mt-6 max-w-2xl border-t pt-6 text-center">
          El mercado mayorista —precio de bolsa, demanda, generación y embalses—
          viene de XM. Las tarifas las publica cada comercializador y cada
          operador de red por metodología CREG.
        </p>
      </main>
    </>
  );
};

export default HomePage;
