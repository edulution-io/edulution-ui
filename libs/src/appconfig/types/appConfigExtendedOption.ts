import { ExtendedOptionFieldType } from '@libs/appconfig/types/extendedOptionFieldType';

export interface AppConfigExtendedOption {
  name: string;
  title: string;
  description: string;
  type: ExtendedOptionFieldType;
  value: string;
}
