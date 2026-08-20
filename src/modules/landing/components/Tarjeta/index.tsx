import { VisualSerie } from "@/modules/oli/components/Chat/VisualSerie";
import { CtaOlibia } from "../CtaOlibia";
import type { Punto } from "../../data/mercadoAbierto";

/**
 * Una tarjeta de la portada: gráfica, lectura y puente a Olibia.
 *
 * La lectura es una frase, no tres columnas de análisis. Un párrafo por
 * tarjeta se lee; una matriz de "qué dice / qué implica / qué hacer" se salta.
 *
 * Si no llegaron datos, la tarjeta no se dibuja — devolver null y perder una
 * tarjeta es mejor que mostrar un recuadro vacío en la cara del producto.
 */
interface TarjetaProps {
  titulo: string;
  subtitulo: string;
  unidad: string;
  puntos: Punto[];
  lectura: string;
  accionOlibia: string;
}

export const Tarjeta = ({
  titulo,
  subtitulo,
  unidad,
  puntos,
  lectura,
  accionOlibia,
}: TarjetaProps) => {
  if (puntos.length < 2) return null;

  return (
    <article className="border-stroke-soft-200 flex flex-col gap-4 rounded-2xl border p-5">
      <VisualSerie
        titulo={titulo}
        subtitulo={subtitulo}
        unidad={unidad}
        puntos={puntos}
        fuente="XM"
      />
      <p className="text-paragraph-sm text-text-sub-600">{lectura}</p>
      <CtaOlibia accion={accionOlibia} />
    </article>
  );
};
