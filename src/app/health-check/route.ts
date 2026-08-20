/**
 * Sonda de vida del contenedor.
 *
 * Solo dice que el proceso de Next responde: no toca el backend ni la base.
 * Es a proposito — si el healthcheck dependiera del backend, una caida de
 * status-bia haria que la plataforma reciclara este contenedor en loop, y la
 * portada (que sabe degradar cuando no hay datos) dejaria de servirse por un
 * problema que no es suyo.
 */
export const dynamic = "force-dynamic";

export const GET = () =>
  new Response("ok", {
    status: 200,
    headers: { "content-type": "text/plain", "cache-control": "no-store" },
  });
