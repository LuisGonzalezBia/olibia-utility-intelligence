import { NextResponse } from "next/server";
import { backendPost } from "@/backend/client";
import { getSessionToken } from "@/auth/session";

/**
 * Guarda el hilo después de cada turno.
 *
 * Va por una ruta propia y no dentro de /api/oli para que un fallo al guardar
 * NO tumbe la respuesta: perder el historial es molesto, perder la respuesta
 * que la persona esperó veinte segundos es peor.
 */
export async function POST(request: Request) {
  const token = await getSessionToken();
  // Sin sesión no hay dónde guardar. No es un error: en la portada se
  // conversa sin cuenta a propósito.
  if (token === undefined) return NextResponse.json({ id: null });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  }

  try {
    const { ok, data } = await backendPost<{ id: number }>(
      "/conversaciones",
      body,
      token,
    );
    return NextResponse.json(ok && data !== null ? data : { id: null });
  } catch {
    return NextResponse.json({ id: null });
  }
}
