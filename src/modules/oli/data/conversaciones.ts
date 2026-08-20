import "server-only";
import { backendGet } from "@/backend/client";
import { getSessionToken } from "@/auth/session";

export interface ConversacionResumen {
  id: number;
  titulo: string;
  updated_at: string;
}

/**
 * Hilos guardados del usuario, del más reciente al más viejo.
 *
 * Si falla, se devuelve vacío en vez de romper la pantalla: no poder listar el
 * historial no debería impedir hacer una pregunta nueva.
 */
export const getConversaciones = async (): Promise<ConversacionResumen[]> => {
  const token = await getSessionToken();
  if (token === undefined) return [];
  try {
    const { ok, data } = await backendGet<{ items?: ConversacionResumen[] }>(
      "/conversaciones",
      token,
    );
    return ok && data !== null ? (data.items ?? []) : [];
  } catch {
    return [];
  }
};
