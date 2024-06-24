export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type AppConfigDto = {
  name: string;
  linkPath: string;
  icon: string;
  appType: AppIntegrationType;
};
