export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type AppConfigType = {
  name: string;
  linkPath: string;
  icon: string;
  appType: AppIntegrationType;
};
