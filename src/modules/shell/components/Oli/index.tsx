import Image from "next/image";

/**
 * Oli, la marca de quien responde.
 *
 * La ilustración es line-art blanco, así que SIEMPRE va sobre fondo oscuro:
 * sobre blanco desaparece. Por eso el contenedor pinta el fondo y no se deja a
 * criterio de cada pantalla — es exactamente el error que tuvimos antes, con
 * un Oli invisible en todas partes.
 */
interface OliProps {
  /** `sm` para la barra y los turnos del chat, `lg` para encabezar. */
  size?: "sm" | "lg";
  /** `binoculars` explora datos; `handshake` acompaña. */
  pose?: "binoculars" | "handshake";
  className?: string;
}

const DIM = {
  sm: { box: "size-8", img: 26 },
  lg: { box: "size-24", img: 80 },
} as const;

export const Oli = ({
  size = "sm",
  pose = "binoculars",
  className = "",
}: OliProps) => {
  const d = DIM[size];
  return (
    <span
      className={`bg-static-black inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${d.box} ${className}`}
    >
      <Image
        src={`/oli/${pose === "handshake" ? "oli-handshake" : "oli-binoculars"}.png`}
        alt="Oli"
        width={d.img}
        height={d.img}
        priority={size === "lg"}
      />
    </span>
  );
};

/** "Oli" con el color de marca, para textos donde se le nombra. */
export const OliNombre = () => (
  <span className="text-primary-base font-medium">Oli</span>
);
