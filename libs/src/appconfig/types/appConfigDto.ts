import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import ExtendedOptionKeysDto from '@libs/appconfig/types/extendedOptionKeysDto';
import { AppConfigOptions } from './appConfigOptionsType';
import AppIntegrationType from './appIntegrationType';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: ExtendedOptionKeysDto;
};
