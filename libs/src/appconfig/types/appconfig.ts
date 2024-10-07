import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptionsType';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: AppConfigExtendedOptions[];
};
