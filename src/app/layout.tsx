import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olibia Utility Intelligence",
  description:
    "Inteligencia de mercado para agentes del sector energético colombiano: competitividad tarifaria, ranking por mercado y análisis con datos públicos.",
  // Oli en la pestaña. Next los tomaría igual de `public/` por convención; se
  // declaran para que sea explícito y no dependa de conocerla.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

/**
 * `className="light"` fija el tema claro.
 *
 * El design system flippea a oscuro solo con `@media (prefers-color-scheme:
 * dark)` sobre `:root`, así que sin esto la app seguía el sistema operativo de
 * quien entra: a quien lo tuviera en oscuro le salía una versión que nadie
 * diseñó ni revisó, con contrastes rotos — el hover de los botones secundarios
 * quedaba blanco sobre blanco.
 *
 * `.light` es del propio DS y está declarada después de ese media query, así
 * que gana por orden de fuente. Es lo mismo que hace olibia-web, donde el tema
 * lo decide next-themes y no el sistema.
 *
 * `color-scheme` acompaña para que los controles nativos —scrollbars, campos de
 * formulario— se pinten claros y no queden oscuros dentro de una página clara.
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="es" className="light" style={{ colorScheme: "light" }}>
    <body className="bg-bg-weak-50 text-text-strong-950 min-h-dvh antialiased">
      {children}
    </body>
  </html>
);

export default RootLayout;
