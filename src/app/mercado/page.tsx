import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/currentUser";
import {
  getMercados,
  getRankingMercado,
} from "@/modules/mercado/data/getRanking";
import {
  construirFilas,
  filaPropia,
} from "@/modules/mercado/models/leaderboard";
import { EncabezadoMercado } from "@/modules/mercado/components/EncabezadoMercado";
import { Leaderboard } from "@/modules/mercado/components/Leaderboard";
import { ResumenPosicion } from "@/modules/mercado/components/ResumenPosicion";
import { SelectorMercado } from "@/modules/mercado/components/SelectorMercado";
import { SelectorTarifa } from "@/modules/mercado/components/SelectorTarifa";
import {
  leerNivelTension,
  leerPropiedad,
} from "@/modules/mercado/models/combos";

/**
 * El producto: la competitividad tarifaria del mercado elegido.
 *
 * El mercado viaja en la URL (`?mercado=`) para que la vista sea enlazable. Sin
 * parámetro se usa el primero disponible — no hay forma de adivinar cuál le
 * importa a cada quien, porque una empresa compite en varios mercados a la vez
 * y el registro no pregunta cuál es el suyo.
 *
 * El nivel de tensión (`?nt=`) y la propiedad de los equipos (`?propiedad=`)
 * viajan igual, y por el mismo motivo: definen QUÉ tarifa se está comparando,
 * así que un enlace a esta vista tiene que llevar esa elección adentro. Quien
 * comparte "mirá cómo estamos en Antioquia" no puede terminar mostrando otra
 * tarifa distinta a la que vio.
 */
const MercadoPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ mercado?: string; nt?: string; propiedad?: string }>;
}) => {
  const user = await getCurrentUser();
  // El registro es el gate del producto: sin sesión, a la puerta.
  if (user === null) redirect("/ingresar");

  const { mercado, nt, propiedad } = await searchParams;
  const mercados = await getMercados();
  const elegido = mercado ?? mercados[0];

  if (elegido === undefined) {
    return (
      <>
        <EncabezadoMercado user={user} />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-paragraph-md text-text-sub-600">
            No pudimos cargar los mercados. Vuelve a intentarlo en un momento.
          </p>
        </main>
      </>
    );
  }

  // Los parámetros inválidos se descartan en vez de propagarse: el backend
  // aplica su default y el usuario ve una tabla real, no un error por un typo
  // en la URL. Cuál quedó usándose se muestra siempre en el selector.
  const ranking = await getRankingMercado(
    elegido,
    leerNivelTension(nt),
    leerPropiedad(propiedad),
  );
  const filas =
    ranking === null ? [] : construirFilas(ranking.items, user.gold_provider);

  return (
    <>
      <EncabezadoMercado user={user} />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {ranking === null ? (
            <h1 className="text-title-h5 text-text-strong-950">{elegido}</h1>
          ) : (
            <ResumenPosicion
              propia={filaPropia(filas)}
              total={filas.length}
              mercado={ranking.market}
              mes={ranking.mes}
            />
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SelectorMercado mercados={mercados} actual={elegido} />
            {ranking !== null && ranking.combos_disponibles.length > 1 && (
              <SelectorTarifa
                combos={ranking.combos_disponibles}
                tensionLevel={ranking.tension_level}
                rateType={ranking.rate_type}
              />
            )}
          </div>
        </div>

        {ranking === null ? (
          <p className="text-paragraph-md text-text-sub-600">
            No hay datos publicados para este mercado.
          </p>
        ) : (
          <Leaderboard filas={filas} />
        )}

        {/* Honestidad de datos: qué se está mirando exactamente.

            El texto lo manda el backend junto con las cifras, no se escribe
            acá. Si la nota vive en la pantalla, cambiar cómo se calcula el dato
            deja la nota mintiendo, y nadie se entera. */}
        {ranking !== null && (
          <div className="text-paragraph-xs text-text-soft-400 border-stroke-soft-200 flex flex-col gap-1 border-t pt-6">
            {ranking.nota !== "" && <p>{ranking.nota}</p>}
            {ranking.fuente !== "" && <p>{ranking.fuente}</p>}
          </div>
        )}
      </main>
    </>
  );
};

export default MercadoPage;
