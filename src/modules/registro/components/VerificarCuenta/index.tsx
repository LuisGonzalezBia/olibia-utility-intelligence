"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FancyButton } from "@biaenergy/ui";

type Estado = "verificando" | "listo" | "invalido" | "error";

interface VerificarCuentaProps {
  token: string;
}

/**
 * Verifica la cuenta al abrir el enlace del correo.
 *
 * Se dispara solo, sin pedir un clic: la persona ya hizo clic en el correo, y
 * pedirle otro para "confirmar que confirma" es fricción sin sentido.
 */
export const VerificarCuenta = ({ token }: VerificarCuentaProps) => {
  const [estado, setEstado] = useState<Estado>(
    token === "" ? "invalido" : "verificando",
  );
  // Los clientes de correo prefetchean enlaces y React 19 monta dos veces en
  // dev: sin esta guarda, el token se consumiría en la primera llamada y la
  // segunda mostraría "enlace inválido" sobre una cuenta ya verificada.
  const yaDisparado = useRef(false);

  useEffect(() => {
    if (token === "" || yaDisparado.current) return;
    yaDisparado.current = true;

    const verificar = async () => {
      try {
        const response = await fetch("/api/verificar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (response.ok) {
          setEstado("listo");
          return;
        }
        // Distinguir "tu enlace no sirve" de "no pudimos conectarnos" importa:
        // ante una caída del backend, decirle que el enlace venció lo hace
        // abandonar un enlace que en realidad es válido. 5xx = problema nuestro.
        setEstado(response.status >= 500 ? "error" : "invalido");
      } catch {
        setEstado("error");
      }
    };
    void verificar();
  }, [token]);

  if (estado === "verificando") {
    return (
      <p className="text-paragraph-md text-text-sub-600">
        Activando tu cuenta…
      </p>
    );
  }

  if (estado === "listo") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-title-h6 text-text-strong-950">
          Tu cuenta quedó activa
        </h1>
        <p className="text-paragraph-sm text-text-sub-600">
          Ya puedes ver la información de tu mercado.
        </p>
        <FancyButton.Root variant="primary" asChild>
          <Link href="/mercado">Ver mi mercado</Link>
        </FancyButton.Root>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-title-h6 text-text-strong-950">
          No pudimos conectarnos
        </h1>
        <p className="text-paragraph-sm text-text-sub-600">
          Prueba de nuevo en un momento abriendo el enlace del correo otra vez.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title-h6 text-text-strong-950">
        Este enlace ya no sirve
      </h1>
      <p className="text-paragraph-sm text-text-sub-600">
        Los enlaces de activación duran 24 horas y se usan una sola vez. Si ya
        activaste tu cuenta, ingresa con tu correo y contraseña.
      </p>
      <FancyButton.Root variant="primary" asChild>
        <Link href="/ingresar">Ingresar</Link>
      </FancyButton.Root>
    </div>
  );
};
