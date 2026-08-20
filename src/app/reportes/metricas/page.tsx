import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/currentUser";
import { getReportes } from "@/modules/reportes/data/getReportes";
import { EncabezadoMercado } from "@/modules/mercado/components/EncabezadoMercado";
import { FormularioMetricas } from "@/modules/reportes/components/FormularioMetricas";
import { Oli } from "@/modules/shell/components/Oli";

/**
 * El otro lado del intercambio.
 *
 * Si a la organización no le aplica —generadores, transportadores, gobierno—
 * no se muestra el formulario: se le dice por qué. Dejarlo visible sería
 * pedirle datos que no tiene y que igual el backend rechazaría.
 */
const MetricasPage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect("/ingresar");

  const { cuota } = await getReportes();

  return (
    <>
      <EncabezadoMercado user={user} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
        <div className="flex items-start gap-4">
          <Oli size="lg" pose="handshake" />
          <div className="flex flex-col gap-2">
            <h1 className="text-title-h5 text-text-strong-950">
              Comparte las métricas de tu empresa
            </h1>
            <p className="text-paragraph-md text-text-sub-600">
              Experiencia de cliente, madurez digital y eficiencia operativa no
              las publica nadie en Colombia. Con las tuyas armamos el contraste,
              y desbloqueas otro reporte, destinatarios adicionales o una
              gráfica más.
            </p>
            <p className="text-paragraph-sm text-text-soft-400">
              Solo tú ves tus cifras. En el benchmark salen agregadas con las
              del resto del sector, nunca con tu nombre.
            </p>
          </div>
        </div>

        {cuota.puede_aportar_metricas ? (
          <FormularioMetricas />
        ) : (
          <p className="border-stroke-soft-200 text-paragraph-sm text-text-sub-600 rounded-2xl border border-dashed p-6">
            {cuota.motivo}
          </p>
        )}
      </main>
    </>
  );
};

export default MetricasPage;
