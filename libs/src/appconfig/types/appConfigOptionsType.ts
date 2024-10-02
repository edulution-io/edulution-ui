import APP_CONFIG_OPTIONS from '../constants/appConfigOptions';

export type AppConfigOptionsType = (typeof APP_CONFIG_OPTIONS)[keyof typeof APP_CONFIG_OPTIONS];

export type AppConfigOptions = {
  [T in AppConfigOptionsType]?: string;
};
