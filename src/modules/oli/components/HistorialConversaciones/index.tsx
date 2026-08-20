import Link from "next/link";
import type { ConversacionResumen } from "../../data/conversaciones";

const cuando = (iso: string) => {
  const d = new Date(iso);
  const horas = (Date.now() - d.getTime()) / 36e5;
  if (horas < 24) {
    return new Intl.DateTimeFormat("es-CO", { timeStyle: "short" }).format(d);
  }
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
  }).format(d);
};

/**
 * Lo que ya le preguntaste a Oli.
 *
 * No es un adorno: media hora después nadie recuerda con qué filtros salió una
 * cifra, y volver a preguntar no garantiza la misma respuesta.
 *
 * Si no hay nada, no se muestra el bloque. Un "aún no tienes conversaciones"
 * ocupa el lugar de las sugerencias, que es lo que de verdad ayuda a arrancar.
 */
export const HistorialConversaciones = ({
  items,
}: {
  items: readonly ConversacionResumen[];
}) => {
  if (items.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className="text-subheading-xs text-text-soft-400 uppercase">
        Tus conversaciones
      </h2>
      <ul className="flex flex-col">
        {items.slice(0, 8).map((c) => (
          <li key={c.id}>
            <Link
              href={`/chat?c=${c.id}`}
              className="hover:bg-bg-weak-50 flex items-center justify-between gap-4 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="text-paragraph-sm text-text-strong-950 truncate">
                {c.titulo}
              </span>
              <span className="text-paragraph-xs text-text-soft-400 shrink-0">
                {cuando(c.updated_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
