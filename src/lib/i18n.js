import { i18n } from "@lingui/core";
// import { en, es, zh, ko, ru, ja, fr, de } from "make-plural/plurals";
import { en, zh } from "make-plural/plurals";
import { LANGUAGE_LOCALSTORAGE_KEY } from "config/localStorage";

// uses BCP-47 codes from https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html
export const locales = {
  en: "English",
  zh: "Chinese"
};

export const defaultLocale = "en";

i18n.loadLocaleData({
  en: { plurals: en },
  zh: { plurals: zh }
});

export function isTestLanguage(locale) {
  return locale === "pseudo";
}
export async function dynamicActivate(locale) {
  const { messages } = await import(`locales/${locale}/messages.po`);
  if (!isTestLanguage(locale)) {
    localStorage.setItem(LANGUAGE_LOCALSTORAGE_KEY, locale);
  }
  i18n.load(locale, messages);
  i18n.activate(locale);
}
