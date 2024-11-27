import { AppConfigField } from '@libs/appconfig/types/appConfigField';

export type AppConfigSection = {
  sectionName: string;
  options: AppConfigField[];
};
