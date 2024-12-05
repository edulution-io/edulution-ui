import i18n from '@/i18n';
import CryptoJS from 'crypto-js';
import { AppConfigDto } from '@libs/appconfig/types/appConfigDto';

export const translateKey = (key: string, variables = {}) => i18n.t(key, variables);

export const decryptPassword = ({ data, key }: { data: string; key: string }) => {
  const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(data, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const findAppConfigByName = (appConfig: AppConfigDto[], entryName: string) =>
  appConfig.find(({ name }) => name === entryName);
