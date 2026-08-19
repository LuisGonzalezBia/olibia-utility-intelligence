export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

/** Español por defecto: la audiencia es el mercado energético colombiano. */
export const defaultLocale: Locale = "es";
