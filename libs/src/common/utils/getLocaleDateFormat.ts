import { de, enUS, fr, Locale } from 'date-fns/locale';

const getLocaleDateFormat = (languageString = 'de'): Locale => {
  switch (languageString) {
    case 'de':
      return de;
    case 'fr':
      return fr;
    default:
      return enUS;
  }
};

export default getLocaleDateFormat;
