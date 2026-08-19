'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@biaenergy/ui';

interface SelectorMercadoProps {
  mercados: readonly string[];
  actual: string;
}

/**
 * Cambia de mercado. El mercado va en la URL (`?mercado=`) y no en estado del
 * cliente: así la vista es enlazable y compartible, y el ranking lo trae el
 * servidor sin que el navegador tenga que pedirlo aparte.
 */
export const SelectorMercado = ({ mercados, actual }: SelectorMercadoProps) => {
  const router = useRouter();
  const params = useSearchParams();

  const cambiar = (mercado: string) => {
    const next = new URLSearchParams(params.toString());
    next.set('mercado', mercado);
    router.push(`/mercado?${next.toString()}`);
  };

  return (
    <Select.Root value={actual} onValueChange={cambiar}>
      <Select.Trigger id="mercado" className="w-full sm:w-64">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {mercados.map(m => (
          <Select.Item key={m} value={m}>
            {m}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
