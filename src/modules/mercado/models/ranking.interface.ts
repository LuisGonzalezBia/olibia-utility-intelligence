/** Un agente en la tabla de competitividad de un mercado. */
export interface AgenteRanking {
  provider: string;
  /** "OR" | "Comercializador" — el OR es el operador de red del mercado. */
  tipo: string;
  cu_simple: number;
  cu_ponderado: number;
  pos_simple: number;
  pos_ponderado: number;
}

/** Tabla completa de un mercado en el último mes publicado. */
export interface RankingMercado {
  /** "YYYY-MM" */
  mes: string;
  market: string;
  horizon: string;
  items: AgenteRanking[];
}

export interface ListaMercados {
  markets: string[];
}

/**
 * Una fila ya lista para pintar: agrega lo que el usuario necesita leer de un
 * vistazo y que no viene del backend.
 */
export interface FilaLeaderboard extends AgenteRanking {
  /** true si es la empresa de quien está mirando. */
  esMio: boolean;
  /**
   * Diferencia porcentual contra MI tarifa. Negativo = más barato que yo.
   * `null` cuando no tengo empresa en este mercado (no hay contra qué comparar).
   */
  deltaPorcentual: number | null;
}
