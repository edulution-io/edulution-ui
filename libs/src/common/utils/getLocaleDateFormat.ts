import i18next from 'i18next';
import { Locale, enUS, de, fr } from 'date-fns/locale';

const getLocaleDateFormat = (): Locale => {
  switch (i18next.options.lng) {
    case 'de':
      return de;
    case 'fr':
      return fr;
    default:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return enUS;
  }
};

export default getLocaleDateFormat;
