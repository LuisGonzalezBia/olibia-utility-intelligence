import type { ComboTarifa } from "./ranking.interface";

/**
 * Cómo se nombra cada propiedad de equipos de cara al usuario.
 *
 * El backend manda el código de la fuente (OPERATOR/USER/SHARED); traducirlo
 * acá y no allá evita que la API cambie de forma cuando cambie la redacción.
 */
const PROPIEDAD: Record<string, string> = {
  OPERATOR: "equipos del operador",
  USER: "equipos del usuario",
  SHARED: "equipos compartidos",
};

/** Texto de una combinación para el selector: "Nivel 1 · equipos del operador". */
export const etiquetaCombo = (c: ComboTarifa): string =>
  `Nivel ${c.tension_level} · ${PROPIEDAD[c.rate_type] ?? c.rate_type}`;

/**
 * Lee el nivel de tensión de la URL. Devuelve undefined si no es 1, 2 o 3 para
 * que el backend aplique su default, en vez de propagar un valor inválido que
 * volvería como una tabla vacía.
 */
export const leerNivelTension = (
  raw: string | undefined,
): number | undefined => {
  if (raw === undefined) return undefined;
  const nt = Number(raw);
  return Number.isInteger(nt) && nt >= 1 && nt <= 3 ? nt : undefined;
};

/** Igual que arriba, para la propiedad de los equipos. */
export const leerPropiedad = (raw: string | undefined): string | undefined => {
  if (raw === undefined) return undefined;
  const rt = raw.toUpperCase();
  return rt in PROPIEDAD ? rt : undefined;
};
