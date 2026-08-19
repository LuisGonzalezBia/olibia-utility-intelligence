"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@biaenergy/ui";
import type { ComboTarifa } from "../../models/ranking.interface";
import { etiquetaCombo } from "../../models/combos";

interface SelectorTarifaProps {
  combos: readonly ComboTarifa[];
  tensionLevel: number;
  rateType: string;
}

/**
 * Elige qué tarifa se está comparando: nivel de tensión y de quién son los
 * equipos de medida.
 *
 * No es un filtro más — es lo que define QUÉ es la cifra. Un mismo agente en el
 * mismo mes se separa cerca de 44% entre un nivel de tensión y otro, así que
 * una tabla sin esta elección visible no se puede leer.
 *
 * Solo se ofrecen las combinaciones que ese mercado publica de verdad: mostrar
 * una opción que devuelve una tabla vacía haría creer que faltan datos.
 */
export const SelectorTarifa = ({
  combos,
  tensionLevel,
  rateType,
}: SelectorTarifaProps) => {
  const router = useRouter();
  const params = useSearchParams();

  // El valor combina las dos dimensiones porque no son independientes: NT2 y
  // NT3 solo existen con equipos del operador, y dos selects separados dejarían
  // elegir combinaciones que nadie publica.
  const actual = `${tensionLevel}|${rateType}`;

  const cambiar = (valor: string) => {
    const [nt, rt] = valor.split("|");
    const next = new URLSearchParams(params.toString());
    if (nt !== undefined) next.set("nt", nt);
    if (rt !== undefined) next.set("propiedad", rt);
    router.push(`/mercado?${next.toString()}`);
  };

  return (
    <Select.Root value={actual} onValueChange={cambiar}>
      <Select.Trigger id="tarifa" className="w-full sm:w-72">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {combos.map((c) => (
          <Select.Item
            key={`${c.tension_level}|${c.rate_type}`}
            value={`${c.tension_level}|${c.rate_type}`}
          >
            {etiquetaCombo(c)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
