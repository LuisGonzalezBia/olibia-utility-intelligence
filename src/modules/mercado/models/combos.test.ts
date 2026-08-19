import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { etiquetaCombo, leerNivelTension, leerPropiedad } from "./combos.ts";

describe("leerNivelTension", () => {
  it("acepta los tres niveles que publica la fuente", () => {
    assert.equal(leerNivelTension("1"), 1);
    assert.equal(leerNivelTension("2"), 2);
    assert.equal(leerNivelTension("3"), 3);
  });

  it("sin parámetro deja decidir al backend", () => {
    assert.equal(leerNivelTension(undefined), undefined);
  });

  it("descarta lo inválido en vez de propagarlo", () => {
    // Propagar un NT=4 devolvería una tabla vacía y el usuario leería "tu
    // mercado no tiene datos" cuando lo que hubo fue un typo en la URL.
    for (const malo of ["0", "4", "-1", "uno", "1.5", ""]) {
      assert.equal(
        leerNivelTension(malo),
        undefined,
        `debería descartar "${malo}"`,
      );
    }
  });
});

describe("leerPropiedad", () => {
  it("acepta las tres propiedades y normaliza a mayúsculas", () => {
    assert.equal(leerPropiedad("OPERATOR"), "OPERATOR");
    assert.equal(leerPropiedad("user"), "USER");
    assert.equal(leerPropiedad("Shared"), "SHARED");
  });

  it("descarta lo que no existe", () => {
    for (const malo of ["OWNER", "COMPARTIDO", "1", ""]) {
      assert.equal(
        leerPropiedad(malo),
        undefined,
        `debería descartar "${malo}"`,
      );
    }
  });
});

describe("etiquetaCombo", () => {
  it("dice el nivel y de quién son los equipos", () => {
    assert.equal(
      etiquetaCombo({ tension_level: 1, rate_type: "OPERATOR", agentes: 5 }),
      "Nivel 1 · equipos del operador",
    );
  });

  it("un código desconocido se muestra crudo, no se traga", () => {
    // Si la fuente agrega una propiedad nueva, es mejor que el usuario vea el
    // código a que la opción desaparezca del selector sin explicación.
    assert.equal(
      etiquetaCombo({ tension_level: 2, rate_type: "NUEVO", agentes: 1 }),
      "Nivel 2 · NUEVO",
    );
  });
});
