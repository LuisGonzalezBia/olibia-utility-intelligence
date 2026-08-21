import { NextResponse } from "next/server";
import { backendPost } from "@/backend/client";
import { getSessionToken } from "@/auth/session";

/**
 * Crea un reporte. El backend descuenta la cuota y valida los límites —acá no
 * se replican, porque tener la regla en dos lados garantiza que un día
 * discrepen y el usuario vea un número distinto al que se aplicó.
 */
export async function POST(request: Request) {
  const token = await getSessionToken();
  if (token === undefined) {
    return NextResponse.json({ error: "sin sesión" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  }

  try {
    const { ok, status, data } = await backendPost<unknown>(
      "/reportes",
      body,
      token,
    );
    // El status viaja tal cual: "te quedaste sin cuota" (403) y "esa gráfica
    // no existe" (400) necesitan mensajes distintos, y aplanarlos a 500
    // dejaría al usuario sin saber cuál de los dos le pasó.
    return NextResponse.json(data ?? {}, { status: ok ? 201 : status });
  } catch {
    return NextResponse.json(
      { error: "No pudimos crear el reporte." },
      { status: 502 },
    );
  }
}
