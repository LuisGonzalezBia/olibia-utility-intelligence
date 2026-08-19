import type { FilaLeaderboard } from '../../models/ranking.interface';

interface ResumenPosicionProps {
  propia: FilaLeaderboard | undefined;
  total: number;
  mercado: string;
  mes: string;
}

const pesos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** "2026-04" → "abril de 2026". El mes crudo no se le muestra a nadie. */
const mesLargo = (mes: string): string => {
  const [anio, m] = mes.split('-');
  if (anio === undefined || m === undefined) return mes;
  return new Date(Number(anio), Number(m) - 1, 1).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric'
  });
};

/**
 * La respuesta a la pregunta que trajo al usuario, antes que la tabla: en qué
 * puesto está y con qué tarifa.
 *
 * Si su empresa no compite en el mercado elegido, se dice explícitamente en vez
 * de mostrar un hueco: cambiar de mercado es una acción válida y frecuente.
 */
export const ResumenPosicion = ({ propia, total, mercado, mes }: ResumenPosicionProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-subheading-xs text-text-soft-400 uppercase">
      {mercado} · {mesLargo(mes)}
    </p>
    {propia === undefined ? (
      <>
        <h1 className="text-title-h5 text-text-strong-950">{total} agentes en este mercado</h1>
        <p className="text-paragraph-sm text-text-sub-600">
          Tu empresa no tiene tarifa publicada acá. Cambia de mercado para ver tu posición.
        </p>
      </>
    ) : (
      <>
        <h1 className="text-title-h4 text-text-strong-950">
          Puesto {propia.pos_ponderado} de {total}
        </h1>
        <p className="text-paragraph-md text-text-sub-600">
          Tu costo unitario es{' '}
          <strong className="text-text-strong-950 font-medium">
            {pesos.format(propia.cu_ponderado)} $/kWh
          </strong>
          .
        </p>
      </>
    )}
  </div>
);
