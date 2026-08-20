import "server-only";
import { backendGet } from "@/backend/client";

/**
 * Datos del mercado SIN sesión, para la portada.
 *
 * El backend expone un subgrupo `/abierto` que solo sirve agregados del
 * sistema: nunca nada con nombre propio de una empresa, nunca nada proyectado.
 *
 * Si algo falla se devuelve vacío y la tarjeta no se dibuja. Una portada con
 * una gráfica rota da peor impresión que una con una tarjeta menos.
 */
export interface Punto {
  fecha: string;
  valor: number;
}

const dia = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" }).format(
    new Date(iso),
  );

const traer = async <T>(ruta: string): Promise<T | null> => {
  try {
    const { ok, data } = await backendGet<T>(`/abierto${ruta}`);
    return ok ? data : null;
  } catch {
    return null;
  }
};

export const getEmbalses = async (): Promise<Punto[]> => {
  const d = await traer<{ days?: { date: string; porc_volu_util?: number }[] }>(
    "/hidrologia",
  );
  return (
    (d?.days ?? [])
      .filter((p) => typeof p.porc_volu_util === "number")
      // Llega como fracción 0-1 y en pantalla se lee en porcentaje.
      .map((p) => ({ fecha: dia(p.date), valor: p.porc_volu_util! * 100 }))
  );
};

export const getAportes = async (): Promise<Punto[]> => {
  const d = await traer<{ days?: { date: string; porc_aportes?: number }[] }>(
    "/hidrologia",
  );
  return (d?.days ?? [])
    .filter((p) => typeof p.porc_aportes === "number")
    .map((p) => ({ fecha: dia(p.date), valor: p.porc_aportes! * 100 }));
};

export const getPrecioBolsa = async (): Promise<Punto[]> => {
  const d = await traer<{ days?: { date: string; avg_pbna?: number }[] }>(
    "/precio-bolsa",
  );
  return (d?.days ?? [])
    .filter((p) => typeof p.avg_pbna === "number")
    .map((p) => ({ fecha: dia(p.date), valor: p.avg_pbna! }));
};
