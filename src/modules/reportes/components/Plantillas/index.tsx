import { Button, FancyButton } from "@biaenergy/ui";
import { PLANTILLAS } from "../../models/plantillas";
import type { Cuota } from "../../models/cuota.interface";

/**
 * Los dos reportes de fábrica, ofrecidos antes de que el usuario tenga que
 * inventar uno.
 *
 * Cuando ya no le queda cuota se muestran igual, apagados y con el motivo: ver
 * lo que podría tener es lo que da sentido a compartir sus métricas.
 * Esconderlos dejaría la pantalla vacía sin explicar por qué.
 */
export const Plantillas = ({ cuota }: { cuota: Cuota }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-label-md text-text-strong-950">
      Empieza con uno de estos
    </h2>
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
            <FancyButton.Root variant="primary" size="xsmall" className="mt-1 self-start">
              Crear este reporte
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
