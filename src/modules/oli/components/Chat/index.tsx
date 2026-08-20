"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FancyButton, Input } from "@biaenergy/ui";
import { Oli } from "@/modules/shell/components/Oli";
import { Markdown } from "./markdown";
import { VisualRanking } from "./VisualRanking";

interface Turno {
  quien: "yo" | "oli";
  texto: string;
  /** Consulta con forma conocida, para dibujarla en vez de leerla. */
  visual?: { tipo: string; datos: unknown } | null;
}

interface ChatOliProps {
  /** Preguntas de arranque. Un chat vacío no sugiere qué se le puede pedir. */
  sugerencias: readonly string[];
  /** Sin sesión, Oli invita a crear cuenta cuando la pregunta es sobre la empresa. */
  conSesion: boolean;
}

export const ChatOli = ({ sugerencias, conSesion }: ChatOliProps) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  const preguntar = async (pregunta: string) => {
    const q = pregunta.trim();
    if (q === "" || pensando) return;

    setError(null);
    setTexto("");
    const conMiTurno: Turno[] = [...turnos, { quien: "yo", texto: q }];
    setTurnos(conMiTurno);
    setPensando(true);

    try {
      const res = await fetch("/api/oli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Se manda la conversación completa: Oli necesita el hilo para que
        // "¿y el mes pasado?" signifique algo.
        body: JSON.stringify({
          mensajes: conMiTurno.map((t) => ({
            role: t.quien === "yo" ? "user" : "assistant",
            content: t.texto,
          })),
        }),
      });

      const data = (await res.json()) as {
        respuesta?: string;
        error?: string;
        visual?: { tipo: string; datos: unknown } | null;
      };
      if (!res.ok) {
        setError(data.error ?? "No pude responder en este momento.");
        return;
      }
      setTurnos([
        ...conMiTurno,
        {
          quien: "oli",
          texto: data.respuesta ?? "",
          visual: data.visual ?? null,
        },
      ]);
    } catch {
      setError("No pudimos conectarnos. Prueba de nuevo en un momento.");
    } finally {
      setPensando(false);
      // Después del render, para que el scroll caiga sobre el turno nuevo.
      requestAnimationFrame(() =>
        finRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void preguntar(texto);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {turnos.length > 0 && (
        <ul className="flex flex-col gap-5">
          {turnos.map((t, i) => (
            <li
              key={i}
              className={t.quien === "yo" ? "flex justify-end" : "flex gap-3"}
            >
              {t.quien === "oli" && <Oli className="mt-0.5" />}
              {t.quien === "yo" ? (
                <div className="bg-bg-weak-50 text-paragraph-sm text-text-strong-950 max-w-[80%] rounded-2xl px-4 py-2.5">
                  {t.texto}
                </div>
              ) : (
                <div className="text-paragraph-sm text-text-strong-950 flex max-w-[85%] flex-col gap-3">
                  {/* La gráfica primero: es lo que se lee de un vistazo. */}
                  {t.visual?.tipo === "ranking_de_tarifas" && (
                    <VisualRanking datos={t.visual.datos as never} />
                  )}
                  <Markdown texto={t.texto} />
                </div>
              )}
            </li>
          ))}
          {pensando && (
            <li className="flex gap-3">
              <Oli className="mt-0.5" />
              <span className="text-paragraph-sm text-text-soft-400">
                Oli está mirando los datos…
              </span>
            </li>
          )}
        </ul>
      )}

      {error !== null && (
        <p className="text-paragraph-sm text-error-base">{error}</p>
      )}

      {/* Las sugerencias solo al principio: después estorban el hilo. */}
      {turnos.length === 0 && (
        <ul className="flex flex-wrap gap-2">
          {sugerencias.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => void preguntar(s)}
                className="border-stroke-soft-200 text-paragraph-sm text-text-sub-600 hover:bg-bg-weak-50 rounded-full border px-4 py-2 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input.Root className="flex-1">
          <Input.Wrapper>
            <Input.Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Pregúntale a Oli sobre el mercado…"
              aria-label="Tu pregunta para Oli"
              disabled={pensando}
            />
          </Input.Wrapper>
        </Input.Root>
        <FancyButton.Root
          type="submit"
          disabled={pensando || texto.trim() === ""}
        >
          Preguntar
        </FancyButton.Root>
      </form>

      {!conSesion && turnos.length > 0 && (
        <p className="text-paragraph-sm text-text-sub-600">
          Para ver cómo está <strong>tu empresa</strong> frente al mercado,{" "}
          <Link href="/registro" className="text-text-strong-950 underline">
            crea tu cuenta gratis
          </Link>{" "}
          o{" "}
          <Link href="/ingresar" className="text-text-strong-950 underline">
            ingresa
          </Link>
          .
        </p>
      )}
      <div ref={finRef} />
    </div>
  );
};
