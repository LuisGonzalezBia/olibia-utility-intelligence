import "server-only";
import { backendGet } from "@/backend/client";
import type { Herramienta } from "./anthropic";

/**
 * Las herramientas de Oli: los mismos endpoints que ya sirve el backend.
 *
 * Deliberadamente pocas. Oli habla con competidores entre sí, así que cada
 * herramienta que se agrega es superficie nueva por la que puede salir un dato
 * que no debería. Ampliar la lista es una decisión de producto, no un detalle
 * técnico.
 *
 * Ninguna toca schemas internos de Bia: solo mercado.
 */
/**
 * Qué herramientas ve Oli según quién pregunta.
 *
 * `agregada` = dato del sistema, sin nombre propio de nadie: embalses,
 * generación del país. `por_empresa` = ranking de tarifas, compras en bolsa y
 * cobertura con razón social — eso solo detrás de sesión, porque publicar el
 * desempeño de una empresa con nombre propio y sin login es otra cosa que
 * mostrar el nivel de un embalse.
 */
type Alcance = "agregada" | "por_empresa";

const ALCANCE: Record<string, Alcance> = {
  mercados_disponibles: "agregada",
  nivel_de_embalses: "agregada",
  generacion_por_empresa: "por_empresa",
  ranking_de_tarifas: "por_empresa",
  compras_en_bolsa_y_cobertura: "por_empresa",
};

const TODAS: Herramienta[] = [
  {
    name: "mercados_disponibles",
    description:
      "Lista los mercados (departamentos/zonas) con tarifas publicadas. Úsala antes de pedir un ranking si el usuario nombra un mercado y no estás seguro de cómo se llama exactamente.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "ranking_de_tarifas",
    description:
      "Ranking de Costo Unitario de los comercializadores de un mercado, para el último mes publicado. Devuelve el nivel de tensión y la propiedad de equipos usados — cítalos SIEMPRE, porque sin ellos el CU no significa nada. La fuente son las tarifas que publica cada agente por metodología CREG, NO XM.",
    input_schema: {
      type: "object",
      properties: {
        market: { type: "string", description: "Nombre exacto del mercado, ej. CARIBEMAR" },
        tension_level: { type: "integer", description: "1, 2 o 3. Default 1" },
        rate_type: {
          type: "string",
          description: "OPERATOR, USER o SHARED. Default OPERATOR",
        },
      },
      required: ["market"],
    },
  },
  {
    name: "compras_en_bolsa_y_cobertura",
    description:
      "Compras y ventas en bolsa por empresa, y su cobertura contratada, para un mes. Cobertura por debajo de 100% significa que el agente cubre parte de su demanda comprando spot, o sea que está expuesto al precio. Fuente: liquidación de XM.",
    input_schema: {
      type: "object",
      properties: {
        mes: { type: "string", description: "YYYY-MM. Sin esto, el último mes cerrado" },
        market_type: {
          type: "string",
          description: "regulated, non_regulated o both. Default both",
        },
      },
    },
  },
  {
    name: "nivel_de_embalses",
    description:
      "Nivel de volumen útil por EMBALSE (24 embalses), no el agregado del sistema. El porcentaje viene como fracción y puede pasar de 1. El nombre del embalse NO es el de su dueño.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "YYYY-MM-DD" },
        to: { type: "string", description: "YYYY-MM-DD" },
        name: { type: "string", description: "Un embalse concreto, ej. GUAVIO" },
      },
    },
  },
  {
    name: "generacion_por_empresa",
    description:
      "Cuánto generó cada empresa por día y fuente primaria. Una empresa con hidráulicas y térmicas aparece en VARIAS filas del mismo día: súmalas antes de comparar. Fuente: XM.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "YYYY-MM-DD" },
        to: { type: "string", description: "YYYY-MM-DD" },
        agent: { type: "string", description: "Razón social exacta" },
      },
    },
  },
];

/**
 * Sin sesión Oli no recibe las herramientas por empresa.
 *
 * No es solo una decisión de producto: hoy esos endpoints exigen sesión y
 * devolverían 401. Dárselas igual haría que Oli las intente, falle y se
 * disculpe — peor experiencia que no ofrecerlas y explicar de entrada qué
 * necesita una cuenta.
 */
export const herramientasPara = (conSesion: boolean): Herramienta[] =>
  conSesion ? TODAS : TODAS.filter((h) => ALCANCE[h.name] === "agregada");

const RUTAS: Record<string, string> = {
  mercados_disponibles: "/mercados",
  ranking_de_tarifas: "/ranking",
  compras_en_bolsa_y_cobertura: "/bolsa",
  nivel_de_embalses: "/embalses",
  generacion_por_empresa: "/generacion",
};

/**
 * Ejecuta una herramienta contra el backend, con la sesión de quien pregunta.
 *
 * El token va siempre: así el backend aplica la misma autorización que si el
 * usuario navegara. Oli no tiene privilegios propios — no puede ver nada que
 * su interlocutor no pueda ver por su cuenta.
 */
export const ejecutarHerramienta = async (
  nombre: string,
  input: Record<string, unknown>,
  token: string | undefined,
): Promise<unknown> => {
  const ruta = RUTAS[nombre];
  if (ruta === undefined) return { error: `herramienta desconocida: ${nombre}` };

  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
  }
  const qs = query.toString();

  try {
    const { ok, status, data } = await backendGet<unknown>(
      qs === "" ? ruta : `${ruta}?${qs}`,
      token,
    );
    if (!ok) {
      // Se le devuelve el error a Oli en vez de lanzarlo: puede explicarle al
      // usuario qué pasó o intentar otra cosa, que es mejor que un 500 mudo.
      return { error: `el endpoint respondió ${status}`, sin_datos: true };
    }
    return data;
  } catch {
    return { error: "no se pudo consultar el dato", sin_datos: true };
  }
};
