import { NextResponse } from "next/server";
import { getSessionToken } from "@/auth/session";
import {
  hayKeyDeOli,
  llamarAOli,
  type Mensaje,
} from "@/modules/oli/server/anthropic";
import { SYSTEM_OLI, SYSTEM_OLI_ANONIMO } from "@/modules/oli/server/prompt";
import {
  HERRAMIENTAS,
  ejecutarHerramienta,
} from "@/modules/oli/server/tools";

/**
 * El turno de Oli: recibe la conversación, consulta lo que necesite y
 * responde.
 *
 * Corre en el servidor porque la key nunca puede llegar al browser, y porque
 * las herramientas usan la cookie de sesión —que es httpOnly— para consultar
 * el backend con la autorización de quien pregunta. Oli no tiene privilegios
 * propios: no ve nada que su interlocutor no pueda ver navegando.
 *
 * Funciona SIN sesión también, con un system prompt distinto: en la portada
 * cualquiera puede preguntar sobre el mercado, y cuando la pregunta se vuelve
 * sobre su empresa, Oli lo invita a crear cuenta. El registro es la bisagra
 * del producto, no un muro previo.
 */

// Tope de vueltas del bucle de herramientas. Sin él, un modelo que insista en
// pedir datos deja la petición colgada y consumiendo tokens.
const MAX_VUELTAS = 4;

export async function POST(request: Request) {
  if (!hayKeyDeOli()) {
    // 503 y no 500: no es una falla, es que falta configurar la key. El front
    // muestra un mensaje distinto para cada caso.
    return NextResponse.json(
      { error: "Oli todavía no está configurado en este entorno." },
      { status: 503 },
    );
  }

  let body: { mensajes?: Mensaje[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  }

  const mensajes = body.mensajes ?? [];
  if (mensajes.length === 0) {
    return NextResponse.json({ error: "falta la pregunta" }, { status: 400 });
  }
  // Un historial sin tope deja que el cliente mande una conversación enorme y
  // la pague la cuenta de Olibia.
  if (mensajes.length > 40) {
    return NextResponse.json({ error: "conversación demasiado larga" }, { status: 413 });
  }

  const token = await getSessionToken();
  const system = token === undefined ? SYSTEM_OLI_ANONIMO : SYSTEM_OLI;

  const historial: Mensaje[] = [...mensajes];

  try {
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta += 1) {
      const respuesta = await llamarAOli(system, historial, HERRAMIENTAS);

      const usos = respuesta.content.filter((c) => c.type === "tool_use");
      if (usos.length === 0) {
        const texto = respuesta.content
          .filter((c) => c.type === "text")
          .map((c) => c.text ?? "")
          .join("\n")
          .trim();
        return NextResponse.json({
          respuesta: texto,
          // El front lo usa para decidir si muestra el botón de registro.
          anonimo: token === undefined,
        });
      }

      historial.push({ role: "assistant", content: respuesta.content });
      const resultados = await Promise.all(
        usos.map(async (u) => ({
          type: "tool_result" as const,
          tool_use_id: u.id,
          content: JSON.stringify(
            await ejecutarHerramienta(
              u.name ?? "",
              (u.input ?? {}) as Record<string, unknown>,
              token,
            ),
          ),
        })),
      );
      historial.push({ role: "user", content: resultados });
    }

    // Se agotaron las vueltas: se dice, en vez de devolver algo a medias sin
    // avisar que quedó incompleto.
    return NextResponse.json({
      respuesta:
        "Me enredé consultando los datos para esta pregunta. ¿La intentamos de otra forma?",
      anonimo: token === undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "No pude consultar los datos en este momento." },
      { status: 502 },
    );
  }
}
