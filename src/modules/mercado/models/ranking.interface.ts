/** Un agente en la tabla de competitividad de un mercado. */
export interface AgenteRanking {
  provider: string;
  /** "OR" | "Comercializador" — el OR es el operador de red del mercado. */
  tipo: string;
  /**
   * Costo Unitario en $/kWh, para el nivel de tensión y propiedad de la tabla.
   * `null` cuando el backend no lo mandó — la pantalla muestra "—", nunca NaN.
   */
  cu: number | null;
  /** Posición dentro del mercado, 1 = más barato. `null` si no vino. */
  pos: number | null;

  // Los seis componentes CREG que suman el CU. Están para que la cifra sea
  // auditable: contra qué componente se pierde, no solo que se va de quinto.
  generacion: number | null;
  comercializacion: number | null;
  transporte: number | null;
  distribucion: number | null;
  perdidas: number | null;
  restricciones: number | null;
}

/**
 * Una combinación de tarifa comparable. Nivel de tensión y propiedad de los
 * equipos de medida definen QUÉ tarifa es: dos agentes solo se comparan dentro
 * de la misma combinación.
 */
export interface ComboTarifa {
  tension_level: number;
  /** "OPERATOR" | "USER" | "SHARED" */
  rate_type: string;
  agentes: number;
}

/** Tabla de un mercado, para una combinación NT/propiedad, en el último mes. */
export interface RankingMercado {
  /** "YYYY-MM" */
  mes: string;
  market: string;
  horizon: string;
  tension_level: number;
  rate_type: string;
  /** De dónde salen las tarifas. Viaja con el dato y se muestra siempre. */
  fuente: string;
  /** Qué es exactamente esta cifra, en palabras. */
  nota: string;
  combos_disponibles: ComboTarifa[];
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
