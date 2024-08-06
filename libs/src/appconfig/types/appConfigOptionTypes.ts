import { AppConfigOptionType } from './appConfigOptions';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionType[];
  isNativeApp: boolean;
};
