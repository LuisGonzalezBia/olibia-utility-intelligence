"use client";

import { useState } from "react";

/**
 * Una serie temporal dibujada. Sirve para embalses, aportes, precio de bolsa y
 * demanda: todas son "un número por fecha".
 *
 * SVG a mano y no una librería de charts: es una línea con área y ejes
 * mínimos, y traer recharts —con todo su peso en el bundle del cliente— por
 * esto no se paga solo. Además así el estilo sale del design system y no de los
 * defaults de la librería.
 *
 * Es componente de cliente por el hover: una serie sin forma de leer el valor
 * de un día concreto obliga a estimarlo a ojo contra el eje, que es justo lo
 * que un gráfico debería evitar.
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
  const [activo, setActivo] = useState<number | null>(null);

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

  /**
   * El punto más cercano al cursor. Se resuelve sobre el ancho renderizado y no
   * sobre las coordenadas del viewBox: el SVG escala con el contenedor, así que
   * usar las del viewBox erraría el índice en cualquier ancho que no sea 560.
   */
  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    if (caja.width === 0) return;
    const xViewBox = ((e.clientX - caja.left) / caja.width) * W;
    const ancho = W - PAD.left - PAD.right;
    const razon = (xViewBox - PAD.left) / ancho;
    const i = Math.round(razon * (puntos.length - 1));
    setActivo(Math.min(puntos.length - 1, Math.max(0, i)));
  };

  const p = activo === null ? undefined : puntos[activo];
  // Porcentaje y no píxeles, por lo mismo que arriba: el contenedor es fluido.
  const izquierdaPct = activo === null ? 0 : (px(activo) / W) * 100;

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

      <div
        className="relative touch-none"
        onPointerMove={alMover}
        onPointerLeave={() => setActivo(null)}
      >
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

          {/* Cruz del punto bajo el cursor. */}
          {activo !== null && p !== undefined && (
            <g>
              <line
                x1={px(activo)}
                x2={px(activo)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                className="stroke-stroke-sub-300"
                strokeWidth="1"
              />
              {/* Anillo del color de la superficie: separa el punto de la línea
                  cuando pasa justo encima de ella. */}
              <circle
                cx={px(activo)}
                cy={py(p.valor)}
                r="5"
                className="fill-primary-base stroke-bg-white-0"
                strokeWidth="2"
              />
            </g>
          )}

          {/* El último punto siempre marcado: dónde terminó la serie es el dato
              que más se busca. Se oculta mientras el cursor está en otro. */}
          {activo !== puntos.length - 1 && (
            <circle
              cx={px(puntos.length - 1)}
              cy={py(ultimo!.valor)}
              r="3.5"
              className="fill-primary-base"
            />
          )}

          <text x={PAD.left} y={H - 6} className="fill-text-soft-400" fontSize="9">
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

        {/* Tooltip en HTML y no en <text> del SVG: hereda la tipografía y los
            tokens del design system, y no hay que calcular el ancho de la caja
            a mano. `-translate-x-1/2` lo centra, y los topes de 6%/94% evitan
            que se salga por los bordes en los extremos de la serie. */}
        {p !== undefined && (
          <div
            className="border-stroke-soft-200 bg-bg-white-0 pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border px-2.5 py-1.5 shadow-lg"
            style={{ left: `${Math.min(94, Math.max(6, izquierdaPct))}%` }}
          >
            <div className="text-paragraph-xs text-text-soft-400 whitespace-nowrap">
              {p.fecha}
            </div>
            <div className="text-label-sm text-text-strong-950 tabular-nums whitespace-nowrap">
              {num.format(p.valor)} {unidad}
            </div>
          </div>
        )}
      </div>

      <span className="text-paragraph-xs text-text-soft-400">
        {unidad} · {fuente}
      </span>
    </figure>
  );
};
