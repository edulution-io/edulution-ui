import i18n from '@/i18n';
import { AppConfigDto } from '@libs/appconfig/types';

export const translateKey = (key: string, variables = {}) => i18n.t(key, variables);

export const findAppConfigByName = (appConfig: AppConfigDto[], entryName: string) =>
  appConfig.find(({ name }) => name === entryName);
