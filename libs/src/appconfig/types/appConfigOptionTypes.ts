import AppExtension from '@libs/appconfig/extensions/types/appExtension';
import { AppConfigOptionType } from './appConfigOptions';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionType[];
  isNativeApp: boolean;
  extendedOptions?: AppExtension[];
};
