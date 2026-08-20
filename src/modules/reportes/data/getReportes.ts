import "server-only";
import { backendGet } from "@/backend/client";
import { getSessionToken } from "@/auth/session";
import type { Cuota, Reporte } from "../models/cuota.interface";

/**
 * Cuota por defecto para cuando el backend no responde.
 *
 * Bloquea en vez de permitir: si no sabemos cuánto le queda al usuario, es
 * preferible que no cree un reporte a que cree uno que después haya que
 * borrarle. Y `puede_aportar_metricas` en false evita mostrarle un formulario
 * a quien quizá no le aplica.
 */
const CUOTA_DESCONOCIDA: Cuota = {
  creditos: 0,
  creditos_disponibles: 0,
  reportes: 0,
  maximo_reportes: 0,
  graficas_por_reporte: 2,
  variables_por_grafica: 2,
  puede_crear_reporte: false,
  puede_agregar_destinatarios: false,
  puede_agregar_grafica: false,
  puede_aportar_metricas: false,
  motivo: "No pudimos cargar tu estado. Vuelve a intentarlo en un momento.",
};

export const getReportes = async (): Promise<{
  reportes: Reporte[];
  cuota: Cuota;
}> => {
  const token = await getSessionToken();
  if (token === undefined) return { reportes: [], cuota: CUOTA_DESCONOCIDA };

  try {
    const { ok, data } = await backendGet<{
      reportes?: Reporte[];
      cuota?: Cuota;
    }>("/reportes", token);
    if (!ok || data === null) return { reportes: [], cuota: CUOTA_DESCONOCIDA };
    // Misma lección que en /mercado: el tipo describe lo que la app asume, no
    // lo que la red garantiza.
    return {
      reportes: data.reportes ?? [],
      cuota: { ...CUOTA_DESCONOCIDA, ...(data.cuota ?? {}) },
    };
  } catch {
    return { reportes: [], cuota: CUOTA_DESCONOCIDA };
  }
};
