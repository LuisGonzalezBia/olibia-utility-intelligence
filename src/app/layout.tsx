import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olibia Utility Intelligence",
  description:
    "Inteligencia de mercado para agentes del sector energético colombiano: competitividad tarifaria, ranking por mercado y análisis con datos públicos.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="es">
    <body className="bg-bg-weak-50 text-text-strong-950 min-h-dvh antialiased">
      {children}
    </body>
  </html>
);

export default RootLayout;
