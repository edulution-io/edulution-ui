import { AppConfigSection } from '@libs/appconfig/types/appConfigSection';
import { AppIntegrationType } from '@libs/appconfig/types/appIntegrationType';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

export type AppConfigDto = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  accessGroups: MultipleSelectorGroup[];
  options?: AppConfigSection[];
  color?: string;
};
