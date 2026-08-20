import Link from "next/link";
import { FancyButton } from "@biaenergy/ui";
import type { Cuota } from "../../models/cuota.interface";

/**
 * Qué tiene desbloqueado el usuario y cómo desbloquear más.
 *
 * El texto viene del backend (`motivo`) y no se escribe acá: es el mismo
 * cálculo que decide si la creación pasa o se rechaza, así que no pueden
 * contradecirse.
 *
 * Cuando `puede_aportar_metricas` es false NO se ofrece el formulario. Es el
 * caso de la CREG o de un generador: no tienen clientes finales, y mostrarles
 * un botón que no lleva a ninguna parte es peor que no mostrarlo.
 */
export const EstadoCuota = ({ cuota }: { cuota: Cuota }) => (
  <section className="border-stroke-soft-200 bg-bg-weak-50 flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-col gap-1">
      <p className="text-label-md text-text-strong-950">
        {cuota.reportes} de {cuota.maximo_reportes}{" "}
        {cuota.maximo_reportes === 1 ? "reporte" : "reportes"}
      </p>
      <p className="text-paragraph-sm text-text-sub-600 max-w-xl">
        {cuota.motivo}
      </p>
      {cuota.creditos_disponibles > 0 && (
        <p className="text-paragraph-xs text-text-soft-400">
          Tienes {cuota.creditos_disponibles}{" "}
          {cuota.creditos_disponibles === 1 ? "desbloqueo" : "desbloqueos"} sin
          usar: otro reporte, destinatarios adicionales o una gráfica más.
        </p>
      )}
    </div>

    {cuota.puede_aportar_metricas && !cuota.puede_crear_reporte && (
      <FancyButton.Root variant="primary" asChild size="small" className="shrink-0">
        <Link href="/reportes/metricas">Compartir mis métricas</Link>
      </FancyButton.Root>
    )}
  </section>
);
