import "server-only";
import { backendGet } from "@/backend/client";
import { getSessionToken } from "@/auth/session";
import type {
  AgenteRanking,
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
    const { ok, data } = await backendGet<RespuestaRanking>(
      `/ranking?${query.toString()}`,
      token,
    );
    return ok && data !== null ? normalizarRanking(data) : null;
  } catch {
    return null;
  }
};

/**
 * Lo que REALMENTE puede llegar por el cable: todo opcional.
 *
 * El tipo `RankingMercado` describe lo que el resto de la app puede asumir,
 * no lo que la red garantiza. Durante un deploy progresivo conviven dos
 * versiones del backend, y la vieja no manda `combos_disponibles` — eso ya
 * tumbó la página entera con un "Cannot read properties of undefined".
 */
type RespuestaRanking = Partial<Omit<RankingMercado, "items">> & {
  items?: FilaCruda[];
};

/**
 * Una fila como puede venir de CUALQUIERA de las dos versiones del backend.
 *
 * La anterior mandaba `cu_simple`/`cu_ponderado` y `pos_simple`/`pos_ponderado`;
 * la nueva manda `cu` y `pos`. Leyendo solo los nombres nuevos, la tabla salía
 * llena de "NaN $/kWh" — que es peor que un error, porque parece un dato.
 *
 * `cu_ponderado` y `cu_simple` eran el mismo número en la matview (verificado:
 * 8.622 filas, cero difieren), así que tomar cualquiera de los dos es correcto,
 * no una aproximación.
 */
type FilaCruda = Partial<AgenteRanking> & {
  cu_ponderado?: number;
  cu_simple?: number;
  pos_ponderado?: number;
  pos_simple?: number;
};

/** Primer número presente; `null` si ninguno vino. */
const primerNumero = (...vs: (number | null | undefined)[]): number | null => {
  for (const v of vs) if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
};

const normalizarFila = (f: FilaCruda): AgenteRanking => ({
  provider: f.provider ?? "",
  tipo: f.tipo ?? "",
  cu: primerNumero(f.cu, f.cu_ponderado, f.cu_simple),
  pos: primerNumero(f.pos, f.pos_ponderado, f.pos_simple),
  generacion: f.generacion ?? null,
  comercializacion: f.comercializacion ?? null,
  transporte: f.transporte ?? null,
  distribucion: f.distribucion ?? null,
  perdidas: f.perdidas ?? null,
  restricciones: f.restricciones ?? null,
});

/**
 * Rellena lo que falte para que ningún consumidor tenga que preguntar si un
 * campo vino.
 *
 * Se normaliza acá y no en la pantalla a propósito: en la pantalla hay que
 * acordarse en cada uso, y basta olvidarlo una vez para tumbar la página. Acá
 * es una sola vez y vale para todos.
 */
const normalizarRanking = (data: RespuestaRanking): RankingMercado => ({
  mes: data.mes ?? "",
  market: data.market ?? "",
  horizon: data.horizon ?? "past",
  tension_level: data.tension_level ?? 1,
  rate_type: data.rate_type ?? "OPERATOR",
  // Sin cita no se inventa una: es preferible no decir nada a atribuirle el
  // dato a una fuente que no lo produjo.
  fuente: data.fuente ?? "",
  nota: data.nota ?? "",
  combos_disponibles: data.combos_disponibles ?? [],
  items: (data.items ?? []).map(normalizarFila),
});
