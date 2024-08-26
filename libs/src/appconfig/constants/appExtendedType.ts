export enum AppExtendedOptions {
  ONLY_OFFICE_URL = 'ONLY_OFFICE_URL',
  ONLY_OFFICE_JWT_SECRET = 'ONLY_OFFICE_JWT_SECRET',
}

export interface AppConfigExtendedOption {
  name: AppExtendedOptions;
  title: string;
  description: string;
  type: string;
  value: string;
}

export interface AppExtendedType {
  [key: string]: AppConfigExtendedOption[];
}

export const appExtendedOptions: AppExtendedType = {
  ONLY_OFFICE: [
    {
      name: AppExtendedOptions.ONLY_OFFICE_URL,
      description: 'appExtendedOptions.onlyOfficeUrl',
      title: 'appExtendedOptions.onlyOfficeUrlTitle',
      type: 'input',
      value: '',
    },
    {
      name: AppExtendedOptions.ONLY_OFFICE_JWT_SECRET,
      title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
      description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
      type: 'input',
      value: '',
    },
  ],
};
