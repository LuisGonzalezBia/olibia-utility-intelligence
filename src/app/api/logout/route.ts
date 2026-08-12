import { NextResponse } from 'next/server';
import { backendPost } from '@/backend/client';
import { clearSessionCookie, getSessionToken } from '@/auth/session';

/**
 * POST /api/logout — cierra la sesión.
 *
 * La cookie se borra SIEMPRE, aunque el backend falle: si no se puede invalidar
 * la sesión del lado del servidor, lo peor sería además dejar al usuario con la
 * cookie puesta creyendo que salió. La sesión huérfana vence sola.
 */
export const POST = async () => {
  const token = await getSessionToken();
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);

  if (token === undefined) return response;

  try {
    await backendPost('/logout', {}, token);
  } catch (error) {
    console.error('[logout] no se pudo invalidar la sesión en el backend:', error);
  }
  return response;
};
