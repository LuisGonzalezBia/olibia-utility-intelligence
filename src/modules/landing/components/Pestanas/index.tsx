"use client";

import { useState, type ReactNode } from "react";

/**
 * Pestañas de la portada.
 *
 * El estado vive en el cliente y no en la URL: las tres secciones se rinden
 * juntas desde el servidor, así que cambiar de pestaña no pide datos ni
 * recarga. Poner el estado en la URL agregaría una navegación por clic sin
 * ganar nada — no hay nada que compartir por separado todavía.
 */
export interface Seccion {
  id: string;
  label: string;
  contenido: ReactNode;
}

export const Pestanas = ({ secciones }: { secciones: Seccion[] }) => {
  const [activa, setActiva] = useState(secciones[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-6">
      {/* Scroll horizontal en móvil: cuatro pestañas no caben, y apilarlas
          rompe la metáfora de pestaña. */}
      <div
        role="tablist"
        aria-label="Secciones del mercado"
        className="border-stroke-soft-200 -mx-6 flex gap-1 overflow-x-auto border-b px-6"
      >
        {secciones.map((s) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={activa === s.id}
            onClick={() => setActiva(s.id)}
            className={`text-label-sm shrink-0 border-b-2 px-4 py-3 transition-colors ${
              activa === s.id
                ? "border-primary-base text-text-strong-950"
                : "text-text-sub-600 hover:text-text-strong-950 border-transparent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {secciones.map((s) => (
        <div key={s.id} role="tabpanel" hidden={activa !== s.id}>
          {s.contenido}
        </div>
      ))}
    </div>
  );
};
