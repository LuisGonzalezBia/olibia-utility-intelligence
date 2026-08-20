"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Oli } from "../Oli";

/**
 * Navegación del producto con sesión.
 *
 * Existe porque sin ella las piezas —mercado, reportes, chat— eran rutas
 * sueltas y el producto se sentía partido en tres herramientas distintas.
 *
 * El chat va primero a propósito: es donde queremos que la gente empiece, no
 * un anexo de los tableros.
 */
/**
 * Dos secciones, no tres.
 *
 * "Mi mercado" era una ruta suelta y en realidad es un REPORTE —el de
 * competitividad— así que vive en Reportes y se alcanza también preguntándole
 * a Oli. Tenerlo en la barra lo hacía ver como una herramienta aparte.
 */
const RUTAS = [
  { href: "/chat", label: "Preguntar" },
  { href: "/reportes", label: "Reportes" },
] as const;

export const NavPrincipal = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Secciones">
      {RUTAS.map((r) => {
        const activa = pathname === r.href || pathname.startsWith(`${r.href}/`);
        return (
          <Link
            key={r.href}
            href={r.href}
            aria-current={activa ? "page" : undefined}
            className={`text-label-sm rounded-lg px-3 py-1.5 transition-colors ${
              activa
                ? "bg-bg-weak-50 text-text-strong-950"
                : "text-text-sub-600 hover:bg-bg-weak-50"
            }`}
          >
            {r.label === "Preguntar" ? (
              <span className="inline-flex items-center gap-1.5">
                <Oli />
                {r.label}
              </span>
            ) : (
              r.label
            )}
          </Link>
        );
      })}
    </nav>
  );
};
