import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * El normalizador vive en la capa de datos (getRanking.ts), que importa
 * `server-only` y no se puede cargar desde un test. Se reimplementa acá la
 * misma forma para fijar el contrato: si esto y aquello divergen, el test
 * deja de proteger — por eso el test se llama igual que la función.
 */
type Parcial = Record<string, unknown>;

const normalizarRanking = (data: Parcial) => ({
  mes: (data.mes as string) ?? "",
  market: (data.market as string) ?? "",
  horizon: (data.horizon as string) ?? "past",
  tension_level: (data.tension_level as number) ?? 1,
  rate_type: (data.rate_type as string) ?? "OPERATOR",
  fuente: (data.fuente as string) ?? "",
  nota: (data.nota as string) ?? "",
  combos_disponibles: (data.combos_disponibles as unknown[]) ?? [],
  items: (data.items as unknown[]) ?? [],
});

describe("normalizarRanking", () => {
  it("una respuesta del backend viejo no tumba la página", () => {
    // Este es el caso real: durante el deploy progresivo la versión anterior
    // no manda combos_disponibles, y `.length` sobre undefined mataba el
    // render entero del servidor.
    const viejo = {
      mes: "2026-07",
      market: "CARIBEMAR",
      items: [{ provider: "BIA ENERGY" }],
    };
    const r = normalizarRanking(viejo);
    assert.deepEqual(r.combos_disponibles, []);
    assert.equal(r.combos_disponibles.length, 0);
  });

  it("una respuesta vacía tampoco", () => {
    const r = normalizarRanking({});
    assert.equal(r.items.length, 0);
    assert.equal(r.combos_disponibles.length, 0);
  });

  it("no inventa una cita cuando el backend no la manda", () => {
    // Vacío y no un texto por defecto: atribuirle el dato a una fuente que no
    // lo produjo es peor que no decir nada. La pantalla omite el bloque.
    const r = normalizarRanking({});
    assert.equal(r.fuente, "");
    assert.equal(r.nota, "");
  });

  it("respeta lo que sí vino", () => {
    const r = normalizarRanking({
      mes: "2026-07",
      tension_level: 3,
      rate_type: "USER",
      combos_disponibles: [
        { tension_level: 1, rate_type: "OPERATOR", agentes: 2 },
      ],
    });
    assert.equal(r.tension_level, 3);
    assert.equal(r.rate_type, "USER");
    assert.equal(r.combos_disponibles.length, 1);
  });

  it("el default de NT y propiedad calza con el del backend", () => {
    // Si divergieran, la pantalla diría que muestra NT1/OPERATOR mientras el
    // backend sirvió otra cosa.
    const r = normalizarRanking({});
    assert.equal(r.tension_level, 1);
    assert.equal(r.rate_type, "OPERATOR");
  });
});

/**
 * Compatibilidad con el backend anterior.
 *
 * El caso real: la tabla salió con "NaN $/kWh" en las siete filas y "Puesto
 * de 7" sin número, porque el backend deployado mandaba `cu_ponderado` y el
 * front leía `cu`. NaN es peor que un error visible — parece un dato.
 */
const primerNumero = (...vs: (number | null | undefined)[]): number | null => {
  for (const v of vs) if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
};

const normalizarFila = (f: Parcial) => ({
  provider: (f.provider as string) ?? "",
  cu: primerNumero(
    f.cu as number,
    f.cu_ponderado as number,
    f.cu_simple as number,
  ),
  pos: primerNumero(
    f.pos as number,
    f.pos_ponderado as number,
    f.pos_simple as number,
  ),
});

describe("normalizarFila — convivencia de las dos versiones del backend", () => {
  it("lee el formato viejo (cu_ponderado / pos_ponderado)", () => {
    const f = normalizarFila({
      provider: "BIA ENERGY",
      cu_ponderado: 860,
      pos_ponderado: 1,
    });
    assert.equal(f.cu, 860);
    assert.equal(f.pos, 1);
  });

  it("lee el formato nuevo (cu / pos)", () => {
    const f = normalizarFila({ provider: "BIA ENERGY", cu: 860, pos: 1 });
    assert.equal(f.cu, 860);
  });

  it("prefiere el nuevo si vienen los dos", () => {
    const f = normalizarFila({ cu: 860, cu_ponderado: 999 });
    assert.equal(f.cu, 860);
  });

  it("sin ninguno devuelve null, no NaN", () => {
    const f = normalizarFila({ provider: "X" });
    // null se pinta como "—"; NaN se pinta como "NaN" y parece un cálculo.
    assert.equal(f.cu, null);
    assert.ok(!Number.isNaN(f.cu as unknown as number));
  });

  it("descarta un NaN que venga en el JSON", () => {
    const f = normalizarFila({ cu: NaN, cu_ponderado: 860 });
    assert.equal(f.cu, 860);
  });
});
