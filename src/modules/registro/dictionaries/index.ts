import type { Locale } from '@/i18n/config';
import { registroDictEs, type RegistroDictionary } from './es';
import { registroDictEn } from './en';

const dicts: Record<Locale, RegistroDictionary> = {
  es: registroDictEs,
  en: registroDictEn
};

export const getRegistroDict = (locale: Locale): RegistroDictionary => dicts[locale] ?? dicts.es;
export type { RegistroDictionary };
