import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptionsType';
import { AppConfigExtendedOption } from '../constants/appConfigExtendedOption';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: AppConfigExtendedOption[];
};
