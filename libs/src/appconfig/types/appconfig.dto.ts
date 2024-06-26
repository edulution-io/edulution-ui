import appIntegrationType from '@libs/appconfig/types/appIntegrationType';
import { AppConfigOptions } from '@libs/appconfig/types/appConfigOptions';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: appIntegrationType;
  options: AppConfigOptions;
};
