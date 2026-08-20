import { VisualRanking } from "./VisualRanking";
import { VisualSerie } from "./VisualSerie";

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

  if (tipo === "precio_de_bolsa") {
    const d = datos as { days?: { date: string; avg_pbna?: number }[] };
    const puntos = (d.days ?? [])
      .filter((p) => typeof p.avg_pbna === "number")
      .map((p) => ({ fecha: dia(p.date), valor: p.avg_pbna! }));
    return (
      <VisualSerie
        titulo="Precio de bolsa"
        subtitulo="Promedio diario"
        unidad="COP/kWh"
        puntos={puntos}
        fuente="XM"
      />
    );
  }

  return null;
};
