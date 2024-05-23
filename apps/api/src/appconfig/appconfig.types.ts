export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type AppConfig = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
};

export type AppConfigOptionType = 'url' | 'apiKey';

export type AppConfigOptions = {
  [T in AppConfigOptionType]?: string;
};
