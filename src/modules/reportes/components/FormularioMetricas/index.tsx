"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, FancyButton, Input } from "@biaenergy/ui";
import { RiErrorWarningFill } from "@biaenergy/ui/icons";
import { FormField } from "@/components/FormField";

/**
 * Las seis métricas que ninguna fuente pública colombiana publica.
 *
 * Todas opcionales menos el período: una utility puede tener NPS y no CSAT, o
 * conocer sus suscriptores y no su opex por cliente. Exigirlas todas haría que
 * nadie complete el formulario, y sin formulario no hay intercambio.
 *
 * Cada campo dice para qué sirve. Pedirle a alguien su recaudo sin explicar
 * qué va a poder comparar con eso es pedirle un favor.
 */
const CAMPOS = [
  {
    name: "nps",
    label: "NPS",
    ayuda: "De −100 a 100. Para compararte en experiencia de cliente.",
    min: -100,
    max: 100,
  },
  {
    name: "csat",
    label: "CSAT",
    ayuda: "De 0 a 100.",
    min: 0,
    max: 100,
  },
  {
    name: "adopcion_digital_pct",
    label: "Adopción digital (%)",
    ayuda: "Qué % de tus clientes usa canales digitales.",
    min: 0,
    max: 100,
  },
  {
    name: "opex_por_cliente_cop",
    label: "Opex por cliente (COP)",
    ayuda: "Costo operativo anual dividido por cliente.",
    min: 0,
  },
  {
    name: "recaudo_pct",
    label: "Recaudo (%)",
    ayuda: "Facturado que efectivamente se cobra.",
    min: 0,
    max: 200,
  },
  {
    name: "suscriptores",
    label: "Suscriptores",
    ayuda: "Clientes activos al cierre del período.",
    min: 0,
  },
] as const;

const mesActual = () => new Date().toISOString().slice(0, 7);

export const FormularioMetricas = () => {
  const router = useRouter();
  const [periodo, setPeriodo] = useState(mesActual());
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const alMenosUna = Object.values(valores).some((v) => v.trim() !== "");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!alMenosUna) {
      // El backend lo rechaza igual, pero decirlo acá evita el viaje.
      setError("Comparte al menos una métrica.");
      return;
    }

    const cuerpo: Record<string, unknown> = { periodo };
    for (const [k, v] of Object.entries(valores)) {
      const t = v.trim();
      if (t === "") continue;
      const n = Number(t);
      if (!Number.isFinite(n)) {
        setError("Hay un valor que no es un número.");
        return;
      }
      cuerpo[k] = n;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/metricas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string; error?: string };
        setError(
          data.message ??
            data.error ??
            "No pudimos guardar tus métricas. Prueba de nuevo.",
        );
        return;
      }
      router.push("/reportes");
      router.refresh();
    } catch {
      setError("No pudimos conectarnos. Prueba de nuevo en un momento.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {error !== null && (
        <Alert.Root status="error" size="small">
          <Alert.Icon as={RiErrorWarningFill} />
          <span>{error}</span>
        </Alert.Root>
      )}

      <FormField id="periodo" label="Período" required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id="periodo"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map((c) => (
          <FormField key={c.name} id={c.name} label={c.label} hint={c.ayuda}>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id={c.name}
                  type="number"
                  inputMode="decimal"
                  value={valores[c.name] ?? ""}
                  onChange={(e) =>
                    setValores((v) => ({ ...v, [c.name]: e.target.value }))
                  }
                />
              </Input.Wrapper>
            </Input.Root>
          </FormField>
        ))}
      </div>

      <FancyButton.Root
        type="submit"
        disabled={enviando || !alMenosUna}
        className="self-start"
      >
        {enviando ? "Guardando…" : "Compartir y desbloquear"}
      </FancyButton.Root>
    </form>
  );
};
