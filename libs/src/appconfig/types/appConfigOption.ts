import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';
import { AppConfigOptionsType } from './appConfigOptionsType';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionsType[];
  isNativeApp: boolean;
  extendedOptions?: AppConfigExtendedOptions[];
};
