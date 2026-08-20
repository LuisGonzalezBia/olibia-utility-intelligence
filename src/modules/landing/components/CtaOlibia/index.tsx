import { FancyButton, Button } from "@biaenergy/ui";
import { Oli } from "@/modules/shell/components/Oli";

/**
 * El puente a Olibia.
 *
 * Utility Intelligence muestra qué está pasando; Olibia es lo que permite
 * actuar sobre eso. El CTA va DESPUÉS de los datos y no antes: aparece cuando
 * la persona ya vio algo que le sirvió, que es cuando la oferta se lee como
 * consecuencia y no como publicidad.
 *
 * `variante` cambia el tono según dónde aparezca: al pie de una tarjeta es una
 * frase corta; al cierre de la página, la invitación completa.
 */
interface CtaOlibiaProps {
  variante?: "tarjeta" | "cierre";
  /** Qué podría hacer con Olibia a partir de ESTA tarjeta. */
  accion?: string;
}

const AGENDA = "https://olibia.bia.app/demo";

export const CtaOlibia = ({ variante = "tarjeta", accion }: CtaOlibiaProps) => {
  if (variante === "tarjeta") {
    return (
      <div className="border-stroke-soft-200 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-paragraph-sm text-text-sub-600">
          {accion ?? "Esto lo podrías automatizar con Olibia."}
        </p>
        <Button.Root asChild size="xsmall" variant="neutral" mode="stroke">
          <a href={AGENDA} target="_blank" rel="noreferrer">
            Ver cómo
          </a>
        </Button.Root>
      </div>
    );
  }

  return (
    <section className="bg-static-black text-static-white flex flex-col items-center gap-5 rounded-3xl px-8 py-14 text-center">
      <Oli size="lg" pose="handshake" className="ring-static-white/10 ring-4" />
      <h2 className="text-title-h4 max-w-xl text-balance">
        Ver el mercado es el primer paso. Actuar sobre él es Olibia.
      </h2>
      <p className="text-paragraph-md max-w-lg opacity-70">
        Compra de energía, gestión de cartera, atención a tus clientes y
        operación de campo, en una sola plataforma.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FancyButton.Root asChild>
          <a href={AGENDA} target="_blank" rel="noreferrer">
            Agenda una demo
          </a>
        </FancyButton.Root>
        <Button.Root asChild variant="neutral" mode="ghost">
          <a
            href="https://web-olibia.bia.app/landing"
            target="_blank"
            rel="noreferrer"
            className="!text-static-white"
          >
            Conoce Olibia
          </a>
        </Button.Root>
      </div>
    </section>
  );
};
