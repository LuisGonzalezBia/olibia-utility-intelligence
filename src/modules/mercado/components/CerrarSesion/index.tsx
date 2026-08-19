"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompactButton } from "@biaenergy/ui";
import { RiLogoutBoxRLine } from "@biaenergy/ui/icons";

/**
 * Cerrar sesión. El endpoint existía desde el principio, pero no había forma de
 * llegar a él desde la interfaz — quien entraba no tenía cómo salir.
 */
export const CerrarSesion = () => {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  const salir = async () => {
    setSaliendo(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      // `refresh` además de `push`: la sesión vive en una cookie httpOnly, así
      // que los Server Components tienen que volver a renderizar para dejar de
      // verla.
      router.push("/");
      router.refresh();
    }
  };

  return (
    <CompactButton.Root
      variant="ghost"
      size="large"
      onClick={salir}
      disabled={saliendo}
      aria-label="Cerrar sesión"
    >
      <CompactButton.Icon as={RiLogoutBoxRLine} />
    </CompactButton.Root>
  );
};
