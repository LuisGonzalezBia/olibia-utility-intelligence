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
