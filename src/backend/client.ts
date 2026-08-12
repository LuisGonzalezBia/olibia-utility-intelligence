import 'server-only';

/**
 * Cliente del backend (bia-growth-status-back). Solo se usa desde route
 * handlers y Server Components: `server-only` hace que importarlo desde
 * cliente falle en build, no en runtime.
 *
 * El browser nunca habla directo con el backend. Así la URL interna del
 * gateway no queda expuesta y el token de sesión puede vivir en una cookie
 * httpOnly que el JavaScript del cliente no puede leer.
 */

const BASE_PATH = '/ms-bia-growth-status/public-ms/utility-intelligence';

export interface BackendResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

const backendUrl = (): string => {
  const base = process.env.BACKEND_URL;
  if (base === undefined || base === '') {
    throw new Error('falta la variable de entorno BACKEND_URL');
  }
  return base.replace(/\/+$/, '');
};

/** POST a un endpoint público de Utility Intelligence. */
export const backendPost = async <T>(
  path: string,
  body: unknown,
  sessionToken?: string
): Promise<BackendResult<T>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionToken !== undefined) headers.Authorization = `Bearer ${sessionToken}`;

  const response = await fetch(`${backendUrl()}${BASE_PATH}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  // Un 204 (logout) no trae cuerpo; parsearlo tiraría error.
  const data = response.status === 204 ? null : ((await response.json().catch(() => null)) as T | null);
  return { ok: response.ok, status: response.status, data };
};

/** GET a un endpoint público de Utility Intelligence, con la sesión del usuario. */
export const backendGet = async <T>(path: string, sessionToken?: string): Promise<BackendResult<T>> => {
  const headers: Record<string, string> = {};
  if (sessionToken !== undefined) headers.Authorization = `Bearer ${sessionToken}`;

  const response = await fetch(`${backendUrl()}${BASE_PATH}${path}`, {
    method: 'GET',
    headers,
    cache: 'no-store'
  });

  const data = (await response.json().catch(() => null)) as T | null;
  return { ok: response.ok, status: response.status, data };
};
