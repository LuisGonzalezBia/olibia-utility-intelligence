import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { backendPost } from '@/backend/client';
import { setSessionCookie } from '@/auth/session';

const verificarSchema = z.object({ token: z.string().min(1).max(200) });

interface SesionBackend {
  token: string;
  expiresAt: string;
}

/**
 * POST /api/verificar — activa la cuenta con el token del correo y deja la
 * sesión abierta.
 *
 * El backend devuelve el token de sesión y acá se guarda en la cookie httpOnly:
 * el token nunca llega al JavaScript del browser. Quien acaba de demostrar que
 * controla el correo entra directo, sin escribir la contraseña otra vez.
 */
export const POST = async (request: NextRequest) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = verificarSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  }

  try {
    const result = await backendPost<SesionBackend>('/verificar', parsed.data);

    // 400 del backend = token inexistente, ya usado o vencido. Los tres casos
    // se ven igual a propósito: no hay razón para decirle a quien prueba
    // tokens en cuál acertó.
    if (!result.ok || result.data === null) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, result.data.token, result.data.expiresAt);
    return response;
  } catch (error) {
    console.error('[verificar] backend inalcanzable:', error);
    return NextResponse.json({ error: 'backend_unreachable' }, { status: 502 });
  }
};
