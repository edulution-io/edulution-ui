import { ExtendedOptionFieldType } from '@libs/appconfig/types/extendedOptionFieldType';
import { AppConfigSectionsType } from '@libs/appconfig/types/appConfigSectionsType';

export interface AppConfigExtendedOption {
  section: AppConfigSectionsType;
  name: string;
  title: string;
  description: string;
  type: ExtendedOptionFieldType;
  value: string;
}
