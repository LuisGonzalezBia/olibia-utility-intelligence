import { EMPRESA_GROUPS, type EmpresaGroup } from "../models/empresas";

/**
 * Normaliza para búsqueda: minúsculas y sin tildes. Nadie escribe tildes en un
 * buscador, y los nombres del sector están llenos de ellas ("NARIÑO",
 * "ELECTRIFICADORA").
 */
export const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Filtra empresas por nombre o cualquiera de sus códigos SIC, y las agrupa por
 * nombre — una empresa con varias actividades (AIR-E: comercialización,
 * distribución, generación) sale UNA vez, nunca una fila por código.
 *
 * Las que tienen ranking van primero: son las que el producto puede resaltar,
 * así que si alguien escribe "ener" queremos que vea antes a los agentes cuya
 * tarifa sí podemos comparar.
 */
export const searchEmpresaGroups = (term: string): readonly EmpresaGroup[] => {
  const q = normalize(term);
  const base =
    q === ""
      ? EMPRESA_GROUPS
      : EMPRESA_GROUPS.filter(
          (g) =>
            normalize(g.name).includes(q) ||
            g.options.some(
              (o) => o.sic !== null && normalize(o.sic).includes(q),
            ),
        );
  return [...base].sort((a, b) => {
    if (a.hasRanking !== b.hasRanking) return a.hasRanking ? -1 : 1;
    return a.name.localeCompare(b.name, "es");
  });
};
