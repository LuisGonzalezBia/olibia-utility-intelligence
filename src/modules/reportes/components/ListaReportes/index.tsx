import Link from "next/link";
import { FancyButton } from "@biaenergy/ui";
import type { Cuota, Reporte } from "../../models/cuota.interface";

const fecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const ListaReportes = ({
  reportes,
  cuota,
}: {
  reportes: readonly Reporte[];
  cuota: Cuota;
}) => {
  if (reportes.length === 0) {
    return (
      <section className="border-stroke-soft-200 flex flex-col items-start gap-4 rounded-2xl border border-dashed p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-label-md text-text-strong-950">
            Todavía no tienes reportes
          </h2>
          <p className="text-paragraph-sm text-text-sub-600 max-w-lg">
            Un reporte junta hasta {cuota.graficas_por_reporte} gráficas del
            mercado y te llega al correo. Puedes armarlo desde cero o pedirle a
            Oli que lo prepare por ti.
          </p>
        </div>
        {cuota.puede_crear_reporte && (
          <FancyButton.Root variant="primary" asChild size="small">
            <Link href="/reportes/nuevo">Crear mi reporte</Link>
          </FancyButton.Root>
        )}
      </section>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reportes.map((r) => (
        <li
          key={r.id}
          className="border-stroke-soft-200 flex items-center justify-between gap-4 rounded-xl border px-5 py-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-label-sm text-text-strong-950">
              {r.nombre}
            </span>
            <span className="text-paragraph-xs text-text-soft-400">
              {fecha.format(new Date(r.created_at))}
              {/* Vacío = solo el dueño, que es el default del producto. */}
              {r.destinatarios.length > 0 &&
                ` · ${r.destinatarios.length} ${
                  r.destinatarios.length === 1
                    ? "destinatario"
                    : "destinatarios"
                }`}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};
