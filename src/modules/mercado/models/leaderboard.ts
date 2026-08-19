import type { AgenteRanking, FilaLeaderboard } from "./ranking.interface";

/**
 * Prepara las filas para pintar: marca cuál es la del usuario y calcula el
 * delta de cada competidor CONTRA SU TARIFA.
 *
 * El delta se enmarca desde la perspectiva de quien mira ("este está 3% más
 * barato que vos"), no en absoluto: es la diferencia que le sirve para decidir.
 * Si su empresa no compite en este mercado, no hay contra qué comparar y el
 * delta queda en null en vez de inventar un cero.
 */
export const construirFilas = (
  items: readonly AgenteRanking[],
  goldProvider: string | null | undefined,
): FilaLeaderboard[] => {
  const mio =
    goldProvider == null
      ? undefined
      : items.find((i) => i.provider === goldProvider);
  const miCu = mio?.cu;

  return items.map((item) => ({
    ...item,
    esMio: mio !== undefined && item.provider === mio.provider,
    deltaPorcentual:
      miCu === undefined || miCu === 0 ? null : ((item.cu - miCu) / miCu) * 100,
  }));
};

/** La fila del usuario, si compite en este mercado. */
export const filaPropia = (
  filas: readonly FilaLeaderboard[],
): FilaLeaderboard | undefined => filas.find((f) => f.esMio);
