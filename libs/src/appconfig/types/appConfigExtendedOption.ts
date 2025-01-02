import { ExtendedOptionFieldType } from '@libs/appconfig/types/extendedOptionFieldType';
import TAppFieldType from '@libs/appconfig/types/tAppFieldType';
import TAppFieldWidth from '@libs/appconfig/types/tAppFieldWidth';

export interface AppConfigExtendedOption {
  name: string;
  title: string;
  description: string;
  type: ExtendedOptionFieldType;
  value: TAppFieldType;
  width?: TAppFieldWidth;
}
