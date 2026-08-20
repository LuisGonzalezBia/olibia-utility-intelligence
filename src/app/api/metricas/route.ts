import { NextResponse } from "next/server";
import { backendPost } from "@/backend/client";
import { getSessionToken } from "@/auth/session";

/** Envía las métricas de la empresa. El backend valida rangos y elegibilidad. */
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
      "/metricas",
      body,
      token,
    );
    // El status se propaga tal cual: el 403 de "tu organización no tiene
    // clientes finales" necesita un mensaje distinto al de un rango inválido.
    return NextResponse.json(data ?? {}, { status: ok ? 200 : status });
  } catch {
    return NextResponse.json(
      { error: "No pudimos guardar tus métricas." },
      { status: 502 },
    );
  }
}
