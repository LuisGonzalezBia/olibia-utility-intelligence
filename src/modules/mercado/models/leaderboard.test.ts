import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { construirFilas, filaPropia } from "./leaderboard.ts";
import type { AgenteRanking } from "./ranking.interface.ts";

const agente = (provider: string, cu: number, pos: number): AgenteRanking => ({
  provider,
  tipo: "Comercializador",
  cu,
  pos,
  // Los componentes no participan del delta; se llenan para cumplir el tipo.
  generacion: 0,
  comercializacion: 0,
  transporte: 0,
  distribucion: 0,
  perdidas: 0,
  restricciones: 0,
});

// Números reales de CARIBEMAR (2026-04), para que el test hable del caso que
// el usuario ve de verdad.
const CARIBEMAR: AgenteRanking[] = [
  agente("ENERBIT", 600.572, 1),
  agente("BIA ENERGY", 616.97, 2),
  agente("ENERTOTAL", 634.998, 3),
  { ...agente("AFINIA", 795.6, 8), tipo: "OR" },
];

describe("construirFilas", () => {
  it("marca la fila del usuario y ninguna otra", () => {
    const filas = construirFilas(CARIBEMAR, "BIA ENERGY");
    assert.deepEqual(
      filas.filter((f) => f.esMio).map((f) => f.provider),
      ["BIA ENERGY"],
    );
  });

  it("calcula el delta contra MI tarifa, con el signo correcto", () => {
    const filas = construirFilas(CARIBEMAR, "BIA ENERGY");
    const enerbit = filas.find((f) => f.provider === "ENERBIT");
    const afinia = filas.find((f) => f.provider === "AFINIA");

    // ENERBIT es más barato que BIA → negativo. (600.572-616.97)/616.97 = -2.66%
    assert.ok(
      Math.abs((enerbit?.deltaPorcentual ?? 0) - -2.66) < 0.05,
      `delta inesperado: ${enerbit?.deltaPorcentual}`,
    );
    // AFINIA es más caro → positivo.
    assert.ok((afinia?.deltaPorcentual ?? 0) > 0);
  });

  it("mi propia fila tiene delta cero", () => {
    const filas = construirFilas(CARIBEMAR, "BIA ENERGY");
    assert.equal(filaPropia(filas)?.deltaPorcentual, 0);
  });

  // Un usuario cuya empresa no compite en el mercado que está mirando: sin
  // referencia, un delta sería una mentira. Debe quedar en null.
  it("sin empresa en el mercado, no inventa deltas", () => {
    const filas = construirFilas(CARIBEMAR, "EMPRESA QUE NO COMPITE");
    assert.ok(filas.every((f) => f.deltaPorcentual === null));
    assert.ok(!filas.some((f) => f.esMio));
  });

  it("sin empresa registrada tampoco inventa deltas", () => {
    assert.ok(
      construirFilas(CARIBEMAR, null).every((f) => f.deltaPorcentual === null),
    );
    assert.ok(
      construirFilas(CARIBEMAR, undefined).every(
        (f) => f.deltaPorcentual === null,
      ),
    );
  });

  // Defensa contra división por cero: un CU en 0 sería un dato corrupto, pero
  // no debe producir Infinity en pantalla.
  it("un CU en cero no produce Infinity", () => {
    const filas = construirFilas(
      [agente("YO", 0, 1), agente("OTRO", 500, 2)],
      "YO",
    );
    assert.ok(filas.every((f) => f.deltaPorcentual === null));
  });

  it("conserva el orden que trae el backend", () => {
    const filas = construirFilas(CARIBEMAR, "BIA ENERGY");
    assert.deepEqual(
      filas.map((f) => f.provider),
      ["ENERBIT", "BIA ENERGY", "ENERTOTAL", "AFINIA"],
    );
  });
});
