import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

/**
 * Nombre de la cookie de sesión. httpOnly: el JavaScript del browser nunca la
 * puede leer, así que un XSS no se lleva la sesión. El token viaja del back al
 * server de Next.js y de ahí a la cookie — nunca pasa por el cliente.
 */
export const SESSION_COOKIE = "oui_session";

const isProd = process.env.NODE_ENV === "production";

export const setSessionCookie = (
  response: NextResponse,
  token: string,
  expiresAt: string,
): void => {
  const expires = new Date(expiresAt);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // En local corremos sobre http, donde `secure` haría que la cookie se
    // descarte en silencio y la sesión "no funcione" sin ningún error visible.
    secure: isProd,
    // `lax` deja que la cookie viaje cuando el usuario llega desde el enlace
    // del correo; `strict` la bloquearía justo en ese caso.
    sameSite: "lax",
    path: "/",
    expires: Number.isNaN(expires.getTime()) ? undefined : expires,
  });
};

export const clearSessionCookie = (response: NextResponse): void => {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

/** Lee el token de sesión server-side. `undefined` si no hay sesión. */
export const getSessionToken = async (): Promise<string | undefined> => {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  return value === "" ? undefined : value;
};
