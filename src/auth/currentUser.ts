import "server-only";
import { cache } from "react";
import { backendGet } from "@/backend/client";
import { getSessionToken } from "./session";

/** Cuenta del padrón de Utility Intelligence, tal como la devuelve el backend. */
export interface CurrentUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  empresa_nombre: string;
  /** `provider` de gold — con esto se resalta su fila en el ranking. */
  gold_provider?: string | null;
  representa_organizacion: boolean;
}

/**
 * Resuelve la cuenta de la sesión actual. `null` si no hay sesión, si venció, o
 * si el backend no responde.
 *
 * Va envuelto en `cache` de React: varios Server Components de la misma página
 * lo piden (el layout para el header, la página para resaltar la fila), y sin
 * esto cada uno dispararía su propia llamada al backend.
 *
 * Una caída del backend se trata como "sin sesión" a propósito: es preferible
 * mandar a la pantalla pública que mostrar un error roto a mitad del producto.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionToken();
  if (token === undefined) return null;

  try {
    const { ok, data } = await backendGet<CurrentUser>("/yo", token);
    return ok ? data : null;
  } catch {
    return null;
  }
});
