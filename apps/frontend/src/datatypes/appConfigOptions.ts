export type AppConfigOptionType = 'url' | 'apiKey';

export type AppConfigOptions = {
  [T in AppConfigOptionType]?: string;
};
