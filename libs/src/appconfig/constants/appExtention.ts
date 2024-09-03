import { AppConfigExtendedOption } from '@libs/appconfig/constants/appExtentionOptions';

export interface AppExtention {
  [key: string]: AppConfigExtendedOption[];
}
