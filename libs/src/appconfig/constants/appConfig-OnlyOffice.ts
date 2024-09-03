export enum ExtendedOptions_OnlyOffice {
  ONLY_OFFICE_URL = 'ONLY_OFFICE_URL',
  ONLY_OFFICE_JWT_SECRET = 'ONLY_OFFICE_JWT_SECRET',
}

export const appExtendedOptions_OnlyOffice = [
  {
    name: ExtendedOptions_OnlyOffice.ONLY_OFFICE_URL,
    title: 'appExtendedOptions.onlyOffice.onlyOfficeUrlTitle',
    description: 'appExtendedOptions.onlyOffice.onlyOfficeUrl',
    type: 'input',
    value: '',
  },
  {
    name: ExtendedOptions_OnlyOffice.ONLY_OFFICE_JWT_SECRET,
    title: 'appExtendedOptions.onlyOffice.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOffice.onlyOfficeJwtSecretDescription',
    type: 'input',
    value: '',
  },
];
