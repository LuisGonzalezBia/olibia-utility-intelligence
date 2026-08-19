import type { CurrentUser } from '@/auth/currentUser';
import { CerrarSesion } from '../CerrarSesion';

interface EncabezadoMercadoProps {
  user: CurrentUser;
}

/** Barra superior del producto: identidad, quién sos y la salida. */
export const EncabezadoMercado = ({ user }: EncabezadoMercadoProps) => (
  <header className="border-stroke-soft-200 bg-bg-white-0 border-b">
    <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-6">
      <span className="text-label-md text-text-strong-950">Olibia Utility Intelligence</span>
      <div className="flex items-center gap-3">
        {/* La empresa importa más que el nombre: es lo que define qué ve. */}
        <span className="text-paragraph-sm text-text-sub-600 hidden truncate sm:block">
          {user.empresa_nombre === '' ? user.email : user.empresa_nombre}
        </span>
        <CerrarSesion />
      </div>
    </div>
  </header>
);
