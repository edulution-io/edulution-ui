import { AppConfigOptionsType } from './appConfigOptionsType';
import AppConfigExtendedOptionsType from './appConfigExtendedOptions';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionsType[];
  isNativeApp: boolean;
  extendedOptions?: AppConfigExtendedOptionsType[];
};
