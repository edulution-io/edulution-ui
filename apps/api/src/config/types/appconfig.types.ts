export enum AppType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type ConfigType = {
  name: string;
  linkPath: string;
  icon: string;
  appType: AppType;
};
