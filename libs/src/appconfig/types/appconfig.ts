import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptions';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
};
