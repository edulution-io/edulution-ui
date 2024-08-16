import { AppConfigOptionType } from './appConfigOptions';
import AppConfigExtendedOptionsType from './appConfigExtendedOptions';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionType[];
  isNativeApp: boolean;
  extendedOptions?: AppConfigExtendedOptionsType[];
};
