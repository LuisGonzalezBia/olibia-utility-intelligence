import { formatearCU } from "@/modules/mercado/models/combos";
import { nombreLegible } from "@/modules/oli/models/formato";

const pesos = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

interface Fila {
  provider?: string;
  tipo?: string;
  cu?: number | null;
  pos?: number | null;
}

/**
 * El ranking dibujado, en vez de escrito por Oli en markdown.
 *
 * Barras proporcionales al CU: la diferencia entre dos agentes se ve sin leer
 * los números, que es justo lo que una tabla de texto no logra.
 */
export const VisualRanking = ({
  datos,
}: {
  datos: {
    market?: string;
    mes?: string;
    tension_level?: number;
    rate_type?: string;
    items?: Fila[];
  };
}) => {
  const items = (datos.items ?? []).filter((i) => typeof i.cu === "number");
  if (items.length === 0) return null;

  const max = Math.max(...items.map((i) => i.cu ?? 0));
  const propiedad =
    datos.rate_type === "USER"
      ? "equipos del usuario"
      : datos.rate_type === "SHARED"
        ? "equipos compartidos"
        : "equipos del operador";

  return (
    <figure className="border-stroke-soft-200 bg-bg-white-0 flex flex-col gap-3 rounded-xl border p-4">
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-label-sm text-text-strong-950">
          {nombreLegible(datos.market ?? "")} · {datos.mes}
        </span>
        <span className="text-paragraph-xs text-text-soft-400">
          Costo unitario · nivel {datos.tension_level ?? 1}, {propiedad}
        </span>
      </figcaption>

      <ul className="flex flex-col gap-2">
        {items.map((f, i) => (
          // La key lleva la posición además del nombre: el backend ya deduplica, pero
          // si vuelve a colarse un agente repetido, React no debe romperse por eso.
          <li key={`${f.provider}-${i}`} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-paragraph-sm text-text-strong-950 truncate">
                {nombreLegible(f.provider ?? "")}
              </span>
              <span className="text-label-sm text-text-strong-950 tabular-nums">
                {formatearCU(f.cu ?? null, pesos)}
              </span>
            </div>
            <div className="bg-bg-weak-50 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary-base h-full rounded-full"
                style={{ width: `${max > 0 ? ((f.cu ?? 0) / max) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <span className="text-paragraph-xs text-text-soft-400">
        $/kWh · tarifas publicadas por cada agente (CREG), no XM
      </span>
    </figure>
  );
};
