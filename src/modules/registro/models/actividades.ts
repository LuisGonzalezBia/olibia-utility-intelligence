/**
 * Actividades que puede declarar quien registra una organización que no está
 * en el catálogo de XM.
 *
 * Los valores en mayúscula son los que espera el backend: son los mismos que
 * trae `energy.agents_dim` para los agentes del catálogo, así que una empresa
 * declarada a mano y una resuelta del catálogo quedan comparables.
 *
 * El orden no es alfabético: arriba las dos que SÍ tienen clientes finales,
 * que son la mayoría de quienes se registran.
 */
export const ACTIVIDADES = [
  { valor: "COMERCIALIZACION", etiqueta: "Comercialización" },
  { valor: "DISTRIBUCION", etiqueta: "Distribución / Operador de red" },
  { valor: "GENERACION", etiqueta: "Generación" },
  { valor: "TRANSPORTE", etiqueta: "Transmisión" },
  { valor: "REGULADOR", etiqueta: "Regulador o entidad de gobierno" },
  { valor: "OTRO", etiqueta: "Otra" },
] as const;

export type ActividadValor = (typeof ACTIVIDADES)[number]["valor"];
