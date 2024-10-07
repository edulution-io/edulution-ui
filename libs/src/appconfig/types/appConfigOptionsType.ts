import APP_CONFIG_OPTION_KEYS from '../constants/appConfigOptionKeys';

export type AppConfigOptionsType = (typeof APP_CONFIG_OPTION_KEYS)[keyof typeof APP_CONFIG_OPTION_KEYS];

export type AppConfigOptions = {
  [T in AppConfigOptionsType]?: string;
};
