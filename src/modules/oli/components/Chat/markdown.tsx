import type { ReactNode } from "react";

/**
 * Render mínimo del markdown que usa Oli: negritas y viñetas.
 *
 * Sin librería a propósito. Lo único que Oli produce hoy es `**negrita**` y
 * listas con guion —el prompt le prohíbe tablas—, y traer un parser completo
 * para eso sería agregar un árbol de dependencias por dos casos.
 *
 * Existe porque los asteriscos se estaban viendo literales en pantalla, que es
 * de las cosas que más rápido hacen ver un producto sin terminar.
 */
const negritas = (texto: string): ReactNode[] =>
  texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i} className="text-text-strong-950 font-medium">
        {parte.slice(2, -2)}
      </strong>
    ) : (
      parte
    ),
  );

export const Markdown = ({ texto }: { texto: string }) => {
  const bloques: ReactNode[] = [];
  let vinetas: string[] = [];

  const cerrarLista = (key: string) => {
    if (vinetas.length === 0) return;
    bloques.push(
      <ul key={key} className="flex list-disc flex-col gap-1 pl-5">
        {vinetas.map((v, i) => (
          <li key={i}>{negritas(v)}</li>
        ))}
      </ul>,
    );
    vinetas = [];
  };

  texto.split("\n").forEach((linea, i) => {
    const l = linea.trim();
    if (l.startsWith("- ") || l.startsWith("• ")) {
      vinetas.push(l.slice(2));
      return;
    }
    cerrarLista(`ul-${i}`);
    if (l !== "") bloques.push(<p key={`p-${i}`}>{negritas(l)}</p>);
  });
  cerrarLista("ul-fin");

  return <div className="flex flex-col gap-2">{bloques}</div>;
};
