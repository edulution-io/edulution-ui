export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type AppConfig = {
  name: string;
  linkPath: string;
  icon: string;
  appType: AppIntegrationType;
};
