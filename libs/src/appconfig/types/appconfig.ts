import AppConfigOptions from '@libs/appconfig/types/appConfigOptions';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AppIntegrationType from './appIntegrationType';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions[];
  accessGroups: MultipleSelectorGroup[];
};
