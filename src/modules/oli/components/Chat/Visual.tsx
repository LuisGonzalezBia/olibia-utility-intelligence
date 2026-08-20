import { VisualRanking } from "./VisualRanking";
import { VisualSerie } from "./VisualSerie";
import { VisualMulti, type SerieGrafica } from "./VisualMulti";

/**
 * Elige qué dibujar según la herramienta que usó Oli.
 *
 * Vive aparte del chat para que agregar una gráfica nueva sea agregar un caso
 * acá, sin tocar la conversación.
 *
 * Cada adaptador conoce la forma EXACTA de su endpoint. Es repetitivo a
 * propósito: un normalizador genérico tendría que adivinar cuál campo es la
 * fecha y cuál el valor, y ya sabemos cómo termina eso — con series vacías que
 * no fallan.
 */
const dia = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" }).format(
    new Date(iso),
  );

export const Visual = ({ tipo, datos }: { tipo: string; datos: unknown }) => {
  if (tipo === "ranking_de_tarifas") {
    return <VisualRanking datos={datos as never} />;
  }

  if (tipo === "hidrologia_del_sistema") {
    const d = datos as { days?: { date: string; porc_volu_util?: number }[] };
    const puntos = (d.days ?? [])
      .filter((p) => typeof p.porc_volu_util === "number")
      // Viene como fracción 0-1 y en pantalla se lee en porcentaje.
      .map((p) => ({ fecha: dia(p.date), valor: p.porc_volu_util! * 100 }));
    return (
      <VisualSerie
        titulo="Nivel de embalses del SIN"
        subtitulo="Volumen útil"
        unidad="%"
        puntos={puntos}
        fuente="XM"
      />
    );
  }

  if (tipo === "crecimiento_de_la_demanda") {
    const d = datos as {
      meses?: {
        mes: string;
        gwh?: number | null;
        gwh_anio_anterior?: number | null;
      }[];
    };
    const meses = d.meses ?? [];
    const series: SerieGrafica[] = [
      {
        nombre: "Demanda",
        puntos: meses
          .filter((m) => typeof m.gwh === "number")
          .map((m) => ({ fecha: m.mes.slice(5), valor: m.gwh! })),
      },
      {
        // La referencia es el mismo mes del año pasado: la comparación que
        // hace legible el crecimiento sin tener que leer los porcentajes.
        nombre: "Año anterior",
        referencia: true,
        puntos: meses
          .filter((m) => typeof m.gwh_anio_anterior === "number")
          .map((m) => ({ fecha: m.mes.slice(5), valor: m.gwh_anio_anterior! })),
      },
    ];
    return (
      <VisualMulti
        titulo="Demanda del SIN y crecimiento interanual"
        subtitulo="Cada mes contra el mismo mes del año anterior"
        unidad="GWh"
        series={series}
        fuente="XM"
      />
    );
  }

  if (tipo === "precio_de_bolsa") {
    const d = datos as { days?: { date: string; avg_pbna?: number }[] };
    const puntos = (d.days ?? [])
      .filter((p) => typeof p.avg_pbna === "number")
      .map((p) => ({ fecha: dia(p.date), valor: p.avg_pbna! }));
    if (puntos.length < 2) return null;

    // El promedio del período como línea de referencia, igual que el layout de
    // mercado: un precio sin su promedio no dice si está caro o barato.
    const promedio = puntos.reduce((s, p) => s + p.valor, 0) / puntos.length;
    const series: SerieGrafica[] = [
      { nombre: "Precio de bolsa", puntos },
      {
        nombre: `Promedio del período (${Math.round(promedio)})`,
        referencia: true,
        puntos: puntos.map((p) => ({ fecha: p.fecha, valor: promedio })),
      },
    ];
    return (
      <VisualMulti
        titulo="Precio de bolsa"
        subtitulo="Promedio diario contra el promedio del período"
        unidad="COP/kWh"
        series={series}
        fuente="XM"
      />
    );
  }

  return null;
};
