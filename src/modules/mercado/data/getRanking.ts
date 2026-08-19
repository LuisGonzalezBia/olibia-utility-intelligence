import 'server-only';
import { backendGet } from '@/backend/client';
import { getSessionToken } from '@/auth/session';
import type { ListaMercados, RankingMercado } from '../models/ranking.interface';

/** Mercados con datos disponibles, para el selector. */
export const getMercados = async (): Promise<string[]> => {
  const token = await getSessionToken();
  if (token === undefined) return [];

  try {
    const { ok, data } = await backendGet<ListaMercados>('/mercados', token);
    return ok && data !== null ? data.markets : [];
  } catch {
    return [];
  }
};

/**
 * Tabla de competitividad de un mercado. `null` cuando no hay datos — el
 * backend distingue "mercado sin datos" (404) de "lista vacía", así que acá se
 * puede mostrar un mensaje honesto en vez de una tabla en blanco.
 */
export const getRankingMercado = async (market: string): Promise<RankingMercado | null> => {
  const token = await getSessionToken();
  if (token === undefined) return null;

  try {
    const { ok, data } = await backendGet<RankingMercado>(
      `/ranking?market=${encodeURIComponent(market)}`,
      token
    );
    return ok ? data : null;
  } catch {
    return null;
  }
};
