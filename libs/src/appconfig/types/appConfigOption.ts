import AppConfigOptions from '@libs/appconfig/types/appConfigOptions';

export type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  isNativeApp: boolean;
  options?: AppConfigOptions[];
};
