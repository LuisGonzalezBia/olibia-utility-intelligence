/**
 * Estado del intercambio: cuánto producto tiene desbloqueado el usuario y qué
 * puede hacer para desbloquear más.
 *
 * Lo calcula el backend entero. El front NO recalcula nada de esto — si
 * tuviera su propia copia de los límites y divergieran, dejaría armar un
 * reporte que el backend rechaza después de que el usuario hizo el trabajo.
 */
export interface Cuota {
  creditos: number;
  creditos_disponibles: number;
  reportes: number;
  maximo_reportes: number;
  graficas_por_reporte: number;
  variables_por_grafica: number;
  puede_crear_reporte: boolean;
  puede_agregar_destinatarios: boolean;
  puede_agregar_grafica: boolean;
  /**
   * false para generadores, transportadores y gobierno: no tienen clientes
   * finales. Cuando es false NO se muestra el formulario de métricas —
   * ofrecerle a la CREG un campo de NPS es pedirle algo que no existe.
   */
  puede_aportar_metricas: boolean;
  /** Explicación en palabras, lista para mostrar tal cual. */
  motivo: string;
}

export interface GraficaReporte {
  titulo: string;
  fuente: string;
  variables: string[];
  filtros?: Record<string, string>;
}

export interface Reporte {
  id: number;
  nombre: string;
  destinatarios: string[];
  created_at: string;
}

/** Las seis métricas que no publica ninguna fuente pública colombiana. */
export interface MetricasEmpresa {
  periodo: string;
  nps: number | null;
  csat: number | null;
  adopcion_digital_pct: number | null;
  opex_por_cliente_cop: number | null;
  recaudo_pct: number | null;
  suscriptores: number | null;
  comentario: string;
}
