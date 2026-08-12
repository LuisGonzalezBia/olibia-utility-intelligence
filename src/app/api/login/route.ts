import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { backendPost } from '@/backend/client';
import { setSessionCookie } from '@/auth/session';

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200)
});

interface SesionBackend {
  token: string;
  expiresAt: string;
}

/**
 * POST /api/login — valida credenciales contra el backend y abre sesión.
 *
 * Se distinguen dos fallas hacia el front, y solo dos: credenciales inválidas
 * (401) y cuenta sin verificar (403). La segunda existe porque las credenciales
 * SON correctas y lo único que falta es el clic en el correo — decirle
 * "contraseña incorrecta" a alguien que la escribió bien lo manda a resetearla
 * sin necesidad.
 */
export const POST = async (request: NextRequest) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  try {
    const result = await backendPost<SesionBackend>('/login', parsed.data);

    if (result.status === 403) {
      return NextResponse.json({ error: 'email_not_verified' }, { status: 403 });
    }
    if (!result.ok || result.data === null) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, result.data.token, result.data.expiresAt);
    return response;
  } catch (error) {
    console.error('[login] backend inalcanzable:', error);
    return NextResponse.json({ error: 'backend_unreachable' }, { status: 502 });
  }
};
