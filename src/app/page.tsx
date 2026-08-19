import Link from "next/link";
import { redirect } from "next/navigation";
import { FancyButton } from "@biaenergy/ui";
import { defaultLocale } from "@/i18n/config";
import { getCurrentUser } from "@/auth/currentUser";
import { getHomeDict } from "@/modules/home/dictionaries";

const HomePage = async () => {
  // Con sesión abierta, la portada de venta ya no aplica: se va derecho al
  // producto. Sin esto, quien acababa de verificar su cuenta volvía a ver
  // "Crear cuenta" y no tenía idea de que ya estaba adentro.
  if ((await getCurrentUser()) !== null) redirect("/mercado");

  const dict = getHomeDict(defaultLocale);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-subheading-xs text-text-soft-400 mb-4 uppercase">
        {dict.eyebrow}
      </p>

      <h1 className="text-title-h3 text-text-strong-950 max-w-2xl text-balance">
        {dict.title}
      </h1>

      {/* Lead en negrita + resto, mismo patrón que el hero de la landing. */}
      <p className="text-paragraph-lg text-text-sub-600 mt-4 max-w-xl">
        <strong className="text-text-strong-950 font-medium">
          {dict.descriptionLead}
        </strong>{" "}
        {dict.description}
      </p>

      {/* Una sola acción primaria: el registro es el gate del producto. */}
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <FancyButton.Root asChild size="medium" className="w-full sm:w-auto">
          <Link href="/registro">{dict.cta}</Link>
        </FancyButton.Root>
        <span className="text-paragraph-xs text-text-soft-400">
          {dict.ctaHint}
        </span>
      </div>

      <p className="text-paragraph-sm text-text-sub-600 mt-4">
        {dict.alreadyHaveAccount}{" "}
        <Link href="/ingresar" className="text-text-strong-950 underline">
          {dict.signIn}
        </Link>
      </p>

      <ul className="border-stroke-soft-200 mt-14 grid gap-8 border-t pt-10 sm:grid-cols-3">
        {dict.features.map((feature) => (
          <li key={feature.title} className="flex flex-col gap-1.5">
            <h2 className="text-label-md text-text-strong-950">
              {feature.title}
            </h2>
            <p className="text-paragraph-sm text-text-sub-600">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>

      {/* Honestidad de datos como principio de primer orden del producto: qué es
          dato público y qué es cálculo nuestro, dicho de entrada. */}
      <p className="text-paragraph-xs text-text-soft-400 mt-12 max-w-2xl">
        {dict.dataNote}
      </p>
    </main>
  );
};

export default HomePage;
