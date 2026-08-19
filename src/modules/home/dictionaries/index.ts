import type { Locale } from "@/i18n/config";
import { homeDictEs, type HomeDictionary } from "./es";
import { homeDictEn } from "./en";

const dicts: Record<Locale, HomeDictionary> = {
  es: homeDictEs,
  en: homeDictEn,
};

export const getHomeDict = (locale: Locale): HomeDictionary =>
  dicts[locale] ?? dicts.es;
export type { HomeDictionary };
