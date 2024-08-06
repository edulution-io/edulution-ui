export type AppConfigOptionType = 'url' | 'apiKey' | 'mails';

export type AppConfigOptions = {
  [T in AppConfigOptionType]?: string;
};
