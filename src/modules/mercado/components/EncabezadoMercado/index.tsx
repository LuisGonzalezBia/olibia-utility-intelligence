import type { CurrentUser } from "@/auth/currentUser";
import { CerrarSesion } from "../CerrarSesion";
import { NavPrincipal } from "@/modules/shell/components/NavPrincipal";
import Link from "next/link";

interface EncabezadoProps {
  user: CurrentUser;
}

/**
 * Barra superior del producto: identidad, navegación, quién sos y la salida.
 *
 * Es la misma en todas las pantallas con sesión — es lo que hace que mercado,
 * reportes y chat se sientan una herramienta y no tres.
 */
export const EncabezadoMercado = ({ user }: EncabezadoProps) => (
  <header className="border-stroke-soft-200 bg-bg-white-0 border-b">
    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
      <div className="flex items-center gap-6">
        <Link
          href="/chat"
          className="text-label-md text-text-strong-950 shrink-0"
        >
          Olibia Utility Intelligence
        </Link>
        <NavPrincipal />
      </div>
      <div className="flex items-center gap-3">
        {/* La empresa importa más que el nombre: es lo que define qué ve. */}
        <span className="text-paragraph-sm text-text-sub-600 hidden truncate sm:block">
          {user.empresa_nombre === "" ? user.email : user.empresa_nombre}
        </span>
        <CerrarSesion />
      </div>
    </div>
  </header>
);
