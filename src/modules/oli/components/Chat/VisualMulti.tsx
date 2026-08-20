/**
 * Gráfica de varias series sobre el mismo eje, con referencia opcional.
 *
 * Es la forma que usa el layout de mercado: una serie principal en indigo y
 * una de contraste punteada en naranja —promedio 12M, fase ENSO, media
 * histórica de aportes—. Leer una serie contra su referencia es lo que
 * convierte un número en una señal.
 *
 * Un solo eje a propósito. Dos escalas distintas en la misma gráfica hacen que
 * cualquier par de curvas parezca correlacionado, y el layout ya recurre a
 * trucos como "ONI ×50 para visual" — que es exactamente el problema. Cuando
 * las magnitudes no se comparan, van dos gráficas.
 */
export interface SerieGrafica {
  nombre: string;
  puntos: { fecha: string; valor: number }[];
  /** Punteada y en naranja: la línea contra la que se lee la principal. */
  referencia?: boolean;
}

interface VisualMultiProps {
  titulo: string;
  subtitulo?: string;
  unidad: string;
  series: SerieGrafica[];
  fuente: string;
  /** Etiqueta cada punto, como el layout. Con muchos puntos estorba. */
  etiquetas?: boolean;
}

const W = 620;
const H = 200;
const PAD = { top: 22, right: 16, bottom: 38, left: 46 };

const COLOR_PRINCIPAL = "var(--color-primary-base, #5B3DF5)";
const COLOR_REFERENCIA = "#F59E0B";

export const VisualMulti = ({
  titulo,
  subtitulo,
  unidad,
  series,
  fuente,
  etiquetas = false,
}: VisualMultiProps) => {
  const conDatos = series.filter((s) => s.puntos.length >= 2);
  if (conDatos.length === 0) return null;

  // El eje X sale de la serie más larga: las demás se alinean por índice, que
  // es válido porque todas vienen del mismo rango de meses.
  const eje = conDatos.reduce((a, b) =>
    b.puntos.length > a.puntos.length ? b : a,
  );
  const n = eje.puntos.length;

  const todos = conDatos.flatMap((s) => s.puntos.map((p) => p.valor));
  const max = Math.max(...todos);
  const min = Math.min(...todos);
  // Sin piso en cero: con los embalses entre 77% y 80%, un eje desde cero
  // aplasta la variación hasta volverla una recta.
  const respiro = (max - min) * 0.12 || Math.abs(max) * 0.05 || 1;
  const yMax = max + respiro;
  const yMin = Math.max(0, min - respiro);

  const px = (i: number) =>
    PAD.left + (i / Math.max(1, n - 1)) * (W - PAD.left - PAD.right);
  const py = (v: number) =>
    PAD.top +
    (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.top - PAD.bottom);

  const num = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

  return (
    <figure className="border-stroke-soft-200 bg-bg-white-0 flex flex-col gap-2 rounded-xl border p-4">
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-label-sm text-text-strong-950">{titulo}</span>
        {subtitulo !== undefined && (
          <span className="text-paragraph-xs text-text-soft-400">
            {subtitulo}
          </span>
        )}
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${titulo}. ${conDatos.map((s) => `${s.nombre}: de ${num.format(s.puntos[0]!.valor)} a ${num.format(s.puntos[s.puntos.length - 1]!.valor)}`).join("; ")} ${unidad}`}
      >
        {[yMin, (yMin + yMax) / 2, yMax].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={py(v)}
              y2={py(v)}
              className="stroke-stroke-soft-200"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={PAD.left - 6}
              y={py(v) + 3}
              textAnchor="end"
              className="fill-text-soft-400"
              fontSize="9"
            >
              {num.format(v)}
            </text>
          </g>
        ))}

        {conDatos.map((s) => {
          const d = s.puntos.map((p, i) => `${px(i)},${py(p.valor)}`).join(" ");
          const color =
            s.referencia === true ? COLOR_REFERENCIA : COLOR_PRINCIPAL;
          return (
            <g key={s.nombre}>
              <polyline
                points={d}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.referencia === true ? "6 4" : undefined}
              />
              {s.puntos.map((p, i) => (
                <circle
                  key={i}
                  cx={px(i)}
                  cy={py(p.valor)}
                  r="2.5"
                  fill={color}
                />
              ))}
              {etiquetas &&
                s.referencia !== true &&
                s.puntos.map((p, i) => (
                  <text
                    key={`l${i}`}
                    x={px(i)}
                    y={py(p.valor) - 8}
                    textAnchor="middle"
                    className="fill-text-strong-950"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {num.format(p.valor)}
                  </text>
                ))}
            </g>
          );
        })}

        {/* Solo primera y última etiqueta del eje X: con doce meses, todas se
            encabalgan y no se lee ninguna. */}
        <text
          x={PAD.left}
          y={H - 20}
          className="fill-text-soft-400"
          fontSize="9"
        >
          {eje.puntos[0]!.fecha}
        </text>
        <text
          x={W - PAD.right}
          y={H - 20}
          textAnchor="end"
          className="fill-text-soft-400"
          fontSize="9"
        >
          {eje.puntos[n - 1]!.fecha}
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {conDatos.map((s) => (
          <span
            key={s.nombre}
            className="text-paragraph-xs text-text-sub-600 flex items-center gap-1.5"
          >
            <span
              className="inline-block h-0.5 w-4 rounded"
              style={{
                background:
                  s.referencia === true ? COLOR_REFERENCIA : COLOR_PRINCIPAL,
                opacity: s.referencia === true ? 0.9 : 1,
              }}
            />
            {s.nombre}
          </span>
        ))}
      </div>

      <span className="text-paragraph-xs text-text-soft-400">
        {unidad} · {fuente}
      </span>
    </figure>
  );
};
