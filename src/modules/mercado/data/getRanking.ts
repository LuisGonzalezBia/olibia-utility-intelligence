import "server-only";
import { backendGet } from "@/backend/client";
import { getSessionToken } from "@/auth/session";
import type {
  ListaMercados,
  RankingMercado,
} from "../models/ranking.interface";

/** Mercados con datos disponibles, para el selector. */
export const getMercados = async (): Promise<string[]> => {
  const token = await getSessionToken();
  if (token === undefined) return [];

  try {
    const { ok, data } = await backendGet<ListaMercados>("/mercados", token);
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
export const getRankingMercado = async (
  market: string,
  tensionLevel?: number,
  rateType?: string,
): Promise<RankingMercado | null> => {
  const token = await getSessionToken();
  if (token === undefined) return null;

  // Sin nivel de tensión ni propiedad se deja decidir al backend, que es donde
  // vive el default. Duplicarlo acá sería tener dos verdades sobre qué tarifa
  // está viendo el usuario.
  const query = new URLSearchParams({ market });
  if (tensionLevel !== undefined)
    query.set("tension_level", String(tensionLevel));
  if (rateType !== undefined) query.set("rate_type", rateType);

  try {
    const { ok, data } = await backendGet<RankingMercado>(
      `/ranking?${query.toString()}`,
      token,
    );
    return ok ? data : null;
  } catch {
    return null;
  }
};
