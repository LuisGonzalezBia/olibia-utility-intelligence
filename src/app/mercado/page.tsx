import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/auth/currentUser';
import { getMercados, getRankingMercado } from '@/modules/mercado/data/getRanking';
import { construirFilas, filaPropia } from '@/modules/mercado/models/leaderboard';
import { EncabezadoMercado } from '@/modules/mercado/components/EncabezadoMercado';
import { Leaderboard } from '@/modules/mercado/components/Leaderboard';
import { ResumenPosicion } from '@/modules/mercado/components/ResumenPosicion';
import { SelectorMercado } from '@/modules/mercado/components/SelectorMercado';

/**
 * El producto: la competitividad tarifaria del mercado elegido.
 *
 * El mercado viaja en la URL (`?mercado=`) para que la vista sea enlazable. Sin
 * parámetro se usa el primero disponible — no hay forma de adivinar cuál le
 * importa a cada quien, porque una empresa compite en varios mercados a la vez
 * y el registro no pregunta cuál es el suyo.
 */
const MercadoPage = async ({
  searchParams
}: {
  searchParams: Promise<{ mercado?: string }>;
}) => {
  const user = await getCurrentUser();
  // El registro es el gate del producto: sin sesión, a la puerta.
  if (user === null) redirect('/ingresar');

  const { mercado } = await searchParams;
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

  const ranking = await getRankingMercado(elegido);
  const filas = ranking === null ? [] : construirFilas(ranking.items, user.gold_provider);

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
          <SelectorMercado mercados={mercados} actual={elegido} />
        </div>

        {ranking === null ? (
          <p className="text-paragraph-md text-text-sub-600">
            No hay datos publicados para este mercado.
          </p>
        ) : (
          <Leaderboard filas={filas} />
        )}

        {/* Honestidad de datos: qué se está mirando exactamente. */}
        <p className="text-paragraph-xs text-text-soft-400 border-stroke-soft-200 border-t pt-6">
          Costo unitario ponderado por demanda, con las tarifas publicadas de cada agente. Fuente:
          XM. Se muestra el último mes con datos completos del mercado.
        </p>
      </main>
    </>
  );
};

export default MercadoPage;
