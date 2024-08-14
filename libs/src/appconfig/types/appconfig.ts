import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { AppConfigOnlyOfficeExtendedOption } from '@libs/appconfig/constants/filesharing/appExtendedOnlyOfficeType';
import AppIntegrationType from './appIntegrationType';
import { AppConfigOptions } from './appConfigOptions';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
  accessGroups: MultipleSelectorGroup[];
  extendedOptions?: AppConfigOnlyOfficeExtendedOption[];
};
