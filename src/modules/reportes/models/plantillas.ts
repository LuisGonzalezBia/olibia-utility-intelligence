import type { GraficaReporte } from "./cuota.interface";

/**
 * Los dos reportes que trae el producto de fábrica.
 *
 * Existen porque un usuario nuevo no sabe qué pedirle a una herramienta que
 * puede mostrarle veinte cosas. Estos dos responden las preguntas que trae
 * cualquiera que entra: cómo estoy yo, y cómo está el mercado.
 *
 * Se definen acá y no en el backend a propósito: son una decisión de producto
 * —qué mostrarle primero a alguien— y va a cambiar más seguido que el esquema
 * de datos.
 */
export interface Plantilla {
  id: string;
  nombre: string;
  descripcion: string;
  /** Por qué le sirve, en la voz del producto. */
  paraQue: string;
  graficas: GraficaReporte[];
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: "competitividad",
    nombre: "Mi competitividad",
    descripcion:
      "Tu posición de tarifa frente a los demás agentes de tu mercado.",
    paraQue:
      "Dónde estás parado y contra qué componente ganas o pierdes: generación, comercialización, distribución, pérdidas o restricciones.",
    graficas: [
      {
        titulo: "Ranking de tarifas de mi mercado",
        fuente: "ranking_de_tarifas",
        // Dos variables por gráfica es el tope de la cuota base.
        variables: ["cu", "pos"],
      },
      {
        titulo: "Mi cobertura frente al mercado",
        fuente: "compras_en_bolsa_y_cobertura",
        variables: ["cobertura_pct", "compras_gwh"],
      },
    ],
  },
  {
    id: "mercado",
    nombre: "Cómo va el mercado",
    descripcion:
      "Aportes y reservas, demanda, precio de bolsa y transacciones del mes.",
    paraQue:
      "El contexto que mueve tu costo antes de que llegue a tu tarifa. Si no representas a un agente, va el total del SIN.",
    graficas: [
      {
        titulo: "Embalses y aportes",
        fuente: "hidrologia_del_sistema",
        variables: ["porc_volu_util", "porc_aportes"],
      },
      {
        titulo: "Precio de bolsa y demanda",
        fuente: "precio_de_bolsa",
        variables: ["avg_pbna", "demanda_gwh"],
      },
    ],
  },
];

export const plantillaPorId = (id: string): Plantilla | undefined =>
  PLANTILLAS.find((p) => p.id === id);
