/**
 * Una serie temporal dibujada. Sirve para embalses, aportes, precio de bolsa y
 * demanda: todas son "un número por fecha".
 *
 * SVG a mano y no una librería de charts: es una línea con área y ejes
 * mínimos, y traer recharts —con React-DOM en el bundle del cliente— por esto
 * no se paga solo. Además así el estilo sale del design system y no de los
 * defaults de la librería.
 */
interface Punto {
  fecha: string;
  valor: number;
}

interface VisualSerieProps {
  titulo: string;
  subtitulo?: string;
  unidad: string;
  puntos: Punto[];
  fuente: string;
}

const W = 560;
const H = 160;
const PAD = { top: 14, right: 14, bottom: 22, left: 40 };

export const VisualSerie = ({
  titulo,
  subtitulo,
  unidad,
  puntos,
  fuente,
}: VisualSerieProps) => {
  if (puntos.length < 2) return null;

  const valores = puntos.map((p) => p.valor);
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  // Un piso en 0 aplasta la variación cuando la serie se mueve poco (embalses
  // entre 77% y 80%). Se usa el rango real con un respiro del 10%.
  const respiro = (max - min) * 0.1 || Math.abs(max) * 0.05 || 1;
  const yMax = max + respiro;
  const yMin = Math.max(0, min - respiro);

  const px = (i: number) =>
    PAD.left + (i / (puntos.length - 1)) * (W - PAD.left - PAD.right);
  const py = (v: number) =>
    PAD.top +
    (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.top - PAD.bottom);

  const linea = puntos.map((p, i) => `${px(i)},${py(p.valor)}`).join(" ");
  const area = `${PAD.left},${H - PAD.bottom} ${linea} ${px(puntos.length - 1)},${H - PAD.bottom}`;

  const num = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
  const ultimo = puntos[puntos.length - 1];
  const primero = puntos[0];

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
        aria-label={`${titulo}: de ${num.format(primero!.valor)} a ${num.format(ultimo!.valor)} ${unidad}`}
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

        <polygon points={area} className="fill-primary-base" opacity="0.12" />
        <polyline
          points={linea}
          fill="none"
          className="stroke-primary-base"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Solo el último punto: marcar todos ensucia y el que importa es dónde terminó. */}
        <circle
          cx={px(puntos.length - 1)}
          cy={py(ultimo!.valor)}
          r="3.5"
          className="fill-primary-base"
        />

        <text
          x={PAD.left}
          y={H - 6}
          className="fill-text-soft-400"
          fontSize="9"
        >
          {primero!.fecha}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          className="fill-text-soft-400"
          fontSize="9"
        >
          {ultimo!.fecha}
        </text>
      </svg>

      <span className="text-paragraph-xs text-text-soft-400">
        {unidad} · {fuente}
      </span>
    </figure>
  );
};
