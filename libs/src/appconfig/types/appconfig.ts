import AppConfigExtension from '@libs/appconfig/extensions/types/appConfigExtension';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptions';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: AppConfigExtension[];
};
