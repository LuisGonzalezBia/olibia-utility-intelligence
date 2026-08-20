/**
 * Oli, la marca de quien responde.
 *
 * En Utility Intelligence quien habla es Oli, no Bia. Aparece en la
 * navegación, encabezando el chat y firmando los reportes: si solo estuviera
 * en una pantalla, el resto del producto se sentiría de otra empresa.
 *
 * Es un componente y no una imagen suelta para que el día que exista la
 * ilustración del personaje se cambie en un lugar y aparezca en todos.
 */
interface OliProps {
  /** `sm` para la barra, `lg` para encabezar una pantalla. */
  size?: "sm" | "lg";
  className?: string;
}

export const Oli = ({ size = "sm", className = "" }: OliProps) => {
  const dim = size === "lg" ? "size-14 text-title-h5" : "size-7 text-label-sm";
  return (
    <span
      aria-hidden
      className={`bg-primary-base text-static-white inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dim} ${className}`}
    >
      O
    </span>
  );
};

/** "Oli" con el punto de marca, para textos donde se le nombra. */
export const OliNombre = () => (
  <span className="text-primary-base font-medium">Oli</span>
);
