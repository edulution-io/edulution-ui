import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptions';
import { AppConfigExtendedOption } from './appExtendedType';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: AppConfigExtendedOption[];
};
