export enum AppOnlyOfficeExtendedOptions {
  ONLY_OFFICE_URL = 'ONLY_OFFICE_URL',
  ONLY_OFFICE_JWT_SECRET = 'ONLY_OFFICE_JWT_SECRET',
}

export type AppConfigExtendedOnlyOfficeOptionsType = keyof typeof AppOnlyOfficeExtendedOptions;

export interface AppConfigOnlyOfficeExtendedOption {
  name: AppOnlyOfficeExtendedOptions;
  title: string;
  description: string;
  type: string;
  value: string;
}

export interface AppExtendedOnlyOfficeType {
  [key: string]: AppConfigOnlyOfficeExtendedOption[];
}

export const appExtendedOnyOfficeOptions: AppExtendedOnlyOfficeType = {
  ONLY_OFFICE: [
    {
      name: AppOnlyOfficeExtendedOptions.ONLY_OFFICE_URL,
      description: 'appExtendedOptions.onlyOfficeUrl',
      title: 'appExtendedOptions.onlyOfficeUrlTitle',
      type: 'input',
      value: '',
    },
    {
      name: AppOnlyOfficeExtendedOptions.ONLY_OFFICE_JWT_SECRET,
      title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
      description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
      type: 'input',
      value: '',
    },
  ],
};
