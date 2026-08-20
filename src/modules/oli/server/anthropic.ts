import "server-only";

/**
 * Cliente mínimo de Anthropic, contra la API por `fetch`.
 *
 * Sin SDK a propósito: agregar una dependencia nueva a este front —y su árbol
 * completo— por lo que son treinta líneas de HTTP no compensa, sobre todo
 * después de lo que ya pasamos cuidando la cadena de npm.
 *
 * La key es la de Olibia, separada de la de Bia: son dos productos con
 * audiencias distintas y una sola mezcla consumo, rate limit y facturación.
 */
const API = "https://api.anthropic.com/v1/messages";
const VERSION = "2023-06-01";

export const MODELO_OLI = process.env.OLI_MODEL ?? "claude-sonnet-5";

export interface Mensaje {
  role: "user" | "assistant";
  content: unknown;
}

export interface Herramienta {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface RespuestaAnthropic {
  content: {
    type: string;
    text?: string;
    id?: string;
    name?: string;
    input?: unknown;
  }[];
  stop_reason: string | null;
}

/** `null` cuando no hay key configurada — el llamador decide qué decirle al usuario. */
export const hayKeyDeOli = (): boolean =>
  (process.env.OLIBIA_ANTHROPIC_API_KEY ?? "") !== "";

export const llamarAOli = async (
  system: string,
  messages: Mensaje[],
  tools: Herramienta[],
): Promise<RespuestaAnthropic> => {
  const key = process.env.OLIBIA_ANTHROPIC_API_KEY ?? "";
  if (key === "") throw new Error("falta OLIBIA_ANTHROPIC_API_KEY");

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": VERSION,
    },
    body: JSON.stringify({
      model: MODELO_OLI,
      max_tokens: 2048,
      system,
      messages,
      ...(tools.length > 0 ? { tools } : {}),
    }),
  });

  if (!res.ok) {
    // El cuerpo del error de Anthropic trae la causa (rate limit, key mala).
    // Se propaga el status pero NO el cuerpo al usuario: puede contener
    // fragmentos del prompt.
    const detalle = await res.text();
    console.error(
      "[oli] Anthropic respondió",
      res.status,
      detalle.slice(0, 400),
    );
    throw new Error(`anthropic ${res.status}`);
  }
  return (await res.json()) as RespuestaAnthropic;
};
