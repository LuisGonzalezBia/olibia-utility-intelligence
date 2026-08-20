/**
 * Los nombres llegan de la fuente en MAYÚSCULA SOSTENIDA ("CARIBEMAR",
 * "BIA ENERGY", "AIR- E S.A.S. E.S.P."). En pantalla eso grita y se lee mal.
 *
 * Se arregla al mostrar y no al guardar: el dato crudo es la llave con la que
 * se consulta el backend, y normalizarlo en la fuente rompería el cruce.
 */
const SIGLAS = new Set([
  "SA",
  "SAS",
  "ESP",
  "EPM",
  "XM",
  "OR",
  "NT",
  "CU",
  "EICE",
  "SCA",
]);

export const nombreLegible = (crudo: string): string => {
  const limpio = crudo.trim();
  if (limpio === "") return "";
  // Si no viene todo en mayúsculas, ya trae su propio formato: no tocarlo.
  if (limpio !== limpio.toUpperCase()) return limpio;

  return limpio
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((parte) => {
      if (/^\s+$/.test(parte) || parte === "-") return parte;
      const sinPuntos = parte.replace(/\./g, "").toUpperCase();
      if (SIGLAS.has(sinPuntos)) return sinPuntos;
      return parte.charAt(0).toUpperCase() + parte.slice(1);
    })
    .join("");
};
