const umlautMap = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
  ß: 'ss',
} as const;

type Umlaut = keyof typeof umlautMap;

const replaceDiacritics = (str: string) => str.replace(/[äöüÄÖÜß]/g, (match) => umlautMap[match as Umlaut]);

export default replaceDiacritics;
