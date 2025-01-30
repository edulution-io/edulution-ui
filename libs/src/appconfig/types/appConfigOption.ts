import type AppConfigExtendedOptionsBySections from '@libs/appconfig/types/appConfigExtendedOptionsBySections';
import { type AppConfigOptionsType } from './appConfigOptionsType';
import type TApps from './appsType';

export type AppConfigOption = {
  id: TApps;
  icon: string;
  color: string;
  options?: AppConfigOptionsType[];
  isNativeApp: boolean;
  extendedOptions?: AppConfigExtendedOptionsBySections;
};
