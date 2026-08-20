import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nombreLegible } from "./formato.ts";

describe("nombreLegible", () => {
  it("baja la mayúscula sostenida que llega de la fuente", () => {
    // "CARIBEMAR" en pantalla grita; el dato crudo sigue siendo la llave.
    assert.equal(nombreLegible("CARIBEMAR"), "Caribemar");
    assert.equal(nombreLegible("BIA ENERGY"), "Bia Energy");
    assert.equal(nombreLegible("ANTIOQUIA"), "Antioquia");
  });

  it("conserva las siglas que sí van en mayúscula", () => {
    // "Enel Colombia S.a E.s.p." se ve peor que el original.
    assert.equal(nombreLegible("ENEL COLOMBIA SA ESP"), "Enel Colombia SA ESP");
    assert.equal(nombreLegible("EPM"), "EPM");
  });

  it("respeta los guiones y espacios del original", () => {
    assert.equal(nombreLegible("AIR- E"), "Air- E");
    assert.equal(nombreLegible("NORTE DE SANTANDER"), "Norte De Santander");
  });

  it("no toca un nombre que ya trae su propio formato", () => {
    // Si alguien escribió "Bia Energy" a mano, no hay nada que arreglar.
    assert.equal(nombreLegible("Bia Energy"), "Bia Energy");
    assert.equal(nombreLegible("Caribe Mar"), "Caribe Mar");
  });

  it("aguanta vacío y espacios", () => {
    assert.equal(nombreLegible(""), "");
    assert.equal(nombreLegible("   "), "");
  });
});
