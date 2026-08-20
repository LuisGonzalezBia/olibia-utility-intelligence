import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/auth/currentUser";
import { EncabezadoMercado } from "@/modules/mercado/components/EncabezadoMercado";
import { Oli, OliNombre } from "@/modules/shell/components/Oli";

/**
 * La puerta de entrada al producto: preguntarle a Oli.
 *
 * ⚠️ Oli todavía no responde. Falta el endpoint conversacional en el backend
 * —hoy el agente vive en el MCP, atado a Slack y a Firebase, y no lo alcanza
 * un usuario de Utility Intelligence.
 *
 * La pantalla existe igual, y no como un "próximamente" vacío: muestra las
 * preguntas que va a poder responder y lleva a lo que ya funciona. Un enlace
 * en la navegación que no lleva a ningún lado se siente peor que una pantalla
 * honesta sobre lo que falta.
 */
const PREGUNTAS = [
  "¿Por qué subió el precio esta semana?",
  "¿Cómo estoy frente a otras empresas de mi mercado?",
  "¿Me conviene contratar más energía ahora?",
  "¿Qué pasa con mi exposición si se intensifica El Niño?",
] as const;

const ChatPage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect("/ingresar");

  return (
    <>
      <EncabezadoMercado user={user} />
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-16">
        <Oli size="lg" />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-title-h4 text-text-strong-950 text-balance">
            Hola, soy <OliNombre />. ¿Qué quieres saber del mercado?
          </h1>
          <p className="text-paragraph-md text-text-sub-600 max-w-xl">
            Todavía estoy aprendiendo a responder aquí. Mientras tanto, estas
            son las preguntas para las que ya tenemos los datos.
          </p>
        </div>

        <ul className="flex w-full flex-col gap-2">
          {PREGUNTAS.map((p) => (
            <li
              key={p}
              className="border-stroke-soft-200 text-paragraph-sm text-text-sub-600 rounded-xl border px-5 py-3.5"
            >
              {p}
            </li>
          ))}
        </ul>

        <p className="text-paragraph-sm text-text-sub-600">
          Por ahora puedes ver{" "}
          <Link href="/mercado" className="text-text-strong-950 underline">
            tu posición en el mercado
          </Link>{" "}
          o{" "}
          <Link href="/reportes" className="text-text-strong-950 underline">
            armar un reporte
          </Link>
          .
        </p>
      </main>
    </>
  );
};

export default ChatPage;
