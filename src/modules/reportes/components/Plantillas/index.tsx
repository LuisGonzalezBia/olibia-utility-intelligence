"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, FancyButton } from "@biaenergy/ui";
import { PLANTILLAS, type Plantilla } from "../../models/plantillas";
import type { Cuota } from "../../models/cuota.interface";

/**
 * Los dos reportes de fábrica, ofrecidos antes de que el usuario tenga que
 * inventar uno.
 *
 * Cuando ya no le queda cuota se muestran igual, apagados y con el motivo: ver
 * lo que podría tener es lo que da sentido a compartir sus métricas.
 * Esconderlos dejaría la pantalla vacía sin explicar por qué.
 *
 * Es componente de cliente porque el botón crea de verdad. Antes era
 * decorativo: se veía habilitado, se dejaba apretar y no pasaba nada — peor que
 * no tenerlo, porque quien lo apretaba quedaba creyendo que gastó su cuota.
 */
export const Plantillas = ({ cuota }: { cuota: Cuota }) => {
  const router = useRouter();
  const [creando, setCreando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const crear = async (p: Plantilla) => {
    setError(null);
    setCreando(p.id);
    try {
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: p.nombre,
          graficas: p.graficas,
          // Sin destinatarios: el único es quien lo crea, y eso lo resuelve el
          // backend con su sesión. Aceptar una lista del cliente abriría la
          // puerta a que alguien se agregue destinatarios que no le tocan.
          destinatarios: [],
        }),
      });

      if (!res.ok) {
        const cuerpo = (await res.json().catch(() => ({}))) as {
          message?: string;
          error?: string;
        };
        // El mensaje del backend antes que uno genérico: distingue "te quedaste
        // sin cuota" de un problema real, y esa diferencia le importa a quien
        // está mirando.
        setError(
          cuerpo.message ??
            cuerpo.error ??
            "No pudimos crear el reporte. Intenta de nuevo.",
        );
        return;
      }

      // Refresca los server components: la lista de reportes y la cuota
      // quedaron viejas en el mismo instante en que esto respondió.
      startTransition(() => router.refresh());
    } catch {
      setError("No pudimos crear el reporte. Intenta de nuevo.");
    } finally {
      setCreando(null);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-label-md text-text-strong-950">
        Empieza con uno de estos
      </h2>

      {error !== null && (
        <p role="alert" className="text-paragraph-sm text-error-base">
          {error}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {PLANTILLAS.map((p) => (
          <li
            key={p.id}
            className="border-stroke-soft-200 flex flex-col gap-3 rounded-2xl border p-5"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-label-sm text-text-strong-950">{p.nombre}</h3>
              <p className="text-paragraph-sm text-text-sub-600">
                {p.descripcion}
              </p>
              <p className="text-paragraph-xs text-text-soft-400 mt-1">
                {p.paraQue}
              </p>
            </div>

            <ul className="flex flex-col gap-1">
              {p.graficas.map((g) => (
                <li
                  key={g.titulo}
                  className="text-paragraph-xs text-text-sub-600 flex items-center gap-2"
                >
                  <span className="bg-primary-base size-1 shrink-0 rounded-full" />
                  {g.titulo}
                </li>
              ))}
            </ul>

            {cuota.puede_crear_reporte ? (
              <FancyButton.Root
                variant="primary"
                size="xsmall"
                className="mt-1 self-start"
                // Se apagan TODOS mientras uno corre: la cuota base alcanza
                // para un reporte, así que dejar apretar el segundo sería
                // ofrecer algo que va a fallar.
                disabled={creando !== null}
                onClick={() => void crear(p)}
              >
                {creando === p.id ? "Creando…" : "Crear este reporte"}
              </FancyButton.Root>
            ) : (
              <Button.Root
                size="xsmall"
                variant="neutral"
                mode="stroke"
                disabled
                className="mt-1 self-start"
              >
                Sin cuota disponible
              </Button.Root>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
