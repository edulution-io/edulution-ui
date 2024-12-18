import AppConfigExtendedOptionsBySections from '@libs/appconfig/types/appConfigExtendedOptionsBySections';
import { AppConfigOptionsType } from './appConfigOptionsType';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionsType[];
  isNativeApp: boolean;
  extendedOptions?: AppConfigExtendedOptionsBySections;
};
