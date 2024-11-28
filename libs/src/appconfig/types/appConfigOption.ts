import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { AppConfigOptionsType } from './appConfigOptionsType';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionsType[];
  isNativeApp: boolean;
  extendedOptions?: AppConfigExtendedOption[];
};
