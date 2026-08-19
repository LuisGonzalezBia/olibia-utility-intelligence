import type { ReactNode } from "react";
import { Hint, Label } from "@biaenergy/ui";

interface FormFieldProps {
  id?: string;
  label: ReactNode;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

/**
 * Espaciado label → control → hint. Mismo componente que usa olibia-web, para
 * que los formularios de las dos superficies se vean idénticos.
 *
 * El error y el hint ocupan el mismo lugar y nunca se muestran juntos: cuando
 * hay error, reemplaza al hint (si no, el usuario lee dos mensajes que compiten).
 */
export const FormField = ({
  id,
  label,
  required,
  error,
  hint,
  children,
}: FormFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <Label.Root htmlFor={id}>
      {label}
      {required ? <Label.Asterisk /> : null}
    </Label.Root>
    {children}
    {error ? (
      <Hint.Root hasError>{error}</Hint.Root>
    ) : hint ? (
      <Hint.Root>{hint}</Hint.Root>
    ) : null}
  </div>
);
