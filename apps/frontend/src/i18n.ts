import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importing translation files
import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  de: {
    translation: translationDE,
  },
};
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    debug: false,
    resources,
    lng: 'de', // default language
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .catch((e) => {
    console.error(e);
  });

export default i18n;
