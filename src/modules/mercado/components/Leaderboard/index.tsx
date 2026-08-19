import { cn } from '@/utils/cn';
import type { FilaLeaderboard } from '../../models/ranking.interface';

interface LeaderboardProps {
  filas: readonly FilaLeaderboard[];
}

const pesos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const porcentaje = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1
});

/** "3,2% más barato que vos" / "1,8% más caro". Null cuando no hay con qué comparar. */
const textoDelta = (delta: number | null): string | null => {
  if (delta === null || delta === 0) return null;
  const magnitud = porcentaje.format(Math.abs(delta));
  return delta < 0 ? `${magnitud}% más barato que tú` : `${magnitud}% más caro que tú`;
};

/**
 * Tabla de competitividad del mercado: una tarjeta por agente, ordenadas por
 * posición.
 *
 * Deliberadamente NO es un gráfico de barras. La longitud de una barra codifica
 * la magnitud del CU, que entre competidores varía poco (600 vs 657) y se lee
 * como "todos parecidos"; lo que el usuario necesita es su posición y la
 * distancia contra cada uno, que acá va dicha en palabras.
 *
 * El OR se distingue con borde punteado y etiqueta: es el operador de red del
 * mercado, no un competidor comparable — casi siempre el más caro, y compararse
 * con él sin marcarlo distorsiona la lectura.
 */
export const Leaderboard = ({ filas }: LeaderboardProps) => (
  <ol className="flex flex-col gap-2">
    {filas.map(fila => {
      const delta = textoDelta(fila.deltaPorcentual);
      const esOR = fila.tipo === 'OR';

      return (
        <li
          key={fila.provider}
          className={cn(
            'flex items-center gap-4 rounded-xl px-4 py-3 ring-1 transition',
            fila.esMio
              ? 'bg-bg-white-0 ring-primary-base shadow-sm ring-2'
              : 'bg-bg-white-0 ring-stroke-soft-200',
            esOR && !fila.esMio && 'ring-stroke-sub-300 border-dashed bg-transparent'
          )}
        >
          <span
            className={cn(
              'text-label-sm w-6 shrink-0 text-center tabular-nums',
              fila.esMio ? 'text-text-strong-950' : 'text-text-soft-400'
            )}
          >
            {fila.pos_ponderado}
          </span>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'truncate',
                  fila.esMio ? 'text-label-md text-text-strong-950' : 'text-label-sm text-text-sub-600'
                )}
              >
                {fila.provider}
              </span>
              {fila.esMio && (
                <span className="text-subheading-2xs bg-primary-base text-static-white rounded-full px-2 py-0.5 uppercase">
                  Tu empresa
                </span>
              )}
              {esOR && (
                <span className="text-subheading-2xs text-text-soft-400 ring-stroke-soft-200 rounded-full px-2 py-0.5 uppercase ring-1">
                  Operador de red
                </span>
              )}
            </div>
            {delta !== null && (
              <span className="text-paragraph-xs text-text-soft-400">{delta}</span>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <span
              className={cn(
                'tabular-nums',
                fila.esMio ? 'text-label-md text-text-strong-950' : 'text-label-sm text-text-sub-600'
              )}
            >
              {pesos.format(fila.cu_ponderado)}
            </span>
            <span className="text-paragraph-xs text-text-soft-400">$/kWh</span>
          </div>
        </li>
      );
    })}
  </ol>
);
