import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/currentUser";
import { EncabezadoMercado } from "@/modules/mercado/components/EncabezadoMercado";
import { Oli, OliNombre } from "@/modules/shell/components/Oli";
import { ChatOli } from "@/modules/oli/components/Chat";
import { HistorialConversaciones } from "@/modules/oli/components/HistorialConversaciones";
import { getConversaciones } from "@/modules/oli/data/conversaciones";

/** Preguntas de arranque para quien ya tiene cuenta: pueden ser sobre su empresa. */
const SUGERENCIAS = [
  "¿Cómo estoy frente a otras empresas de mi mercado?",
  "¿Cómo van los embalses?",
  "¿Quién compró más en bolsa el mes pasado?",
  "¿Qué generó cada empresa esta semana?",
] as const;

const ChatPage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect("/ingresar");

  const conversaciones = await getConversaciones();

  return (
    <>
      <EncabezadoMercado user={user} />
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-12">
        <Oli size="lg" />
        <h1 className="text-title-h4 text-text-strong-950 text-center text-balance">
          Hola, soy <OliNombre />. ¿Qué quieres saber del mercado?
        </h1>
        <ChatOli sugerencias={SUGERENCIAS} conSesion />
        <HistorialConversaciones items={conversaciones} />
      </main>
    </>
  );
};

export default ChatPage;
