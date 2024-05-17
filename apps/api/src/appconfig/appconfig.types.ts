export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}
export type AppConfig = {
  name: string;
  /* @deprecated use options.url */
  linkPath: string;
  icon: string;
  appType: AppIntegrationType;
  options: {
    url?: string;
    apiKey?: string;
    [key: string]: string | undefined;
  };
};
