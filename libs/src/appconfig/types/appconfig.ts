import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { AppConfigExtendedOption } from '@libs/appconfig/constants/appExtendedType';
import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptionsType';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: AppConfigExtendedOption[];
};
