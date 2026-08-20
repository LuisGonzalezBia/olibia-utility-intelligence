import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/currentUser";
import { getReportes } from "@/modules/reportes/data/getReportes";
import { EncabezadoMercado } from "@/modules/mercado/components/EncabezadoMercado";
import { EstadoCuota } from "@/modules/reportes/components/EstadoCuota";
import { ListaReportes } from "@/modules/reportes/components/ListaReportes";

/**
 * Reportes del usuario y el estado del intercambio.
 *
 * El límite es estrecho a propósito —un reporte, dos gráficas, dos variables,
 * solo para vos— porque es lo que detona compartir las métricas de la empresa.
 * Toda esa lógica la resuelve el backend; acá solo se pinta lo que dice.
 */
const ReportesPage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect("/ingresar");

  const { reportes, cuota } = await getReportes();

  return (
    <>
      <EncabezadoMercado user={user} />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-title-h5 text-text-strong-950">Tus reportes</h1>
          <p className="text-paragraph-sm text-text-sub-600">
            Un reporte con dos gráficas, que llega a tu correo.
          </p>
        </div>

        <EstadoCuota cuota={cuota} />
        <ListaReportes reportes={reportes} cuota={cuota} />
      </main>
    </>
  );
};

export default ReportesPage;
