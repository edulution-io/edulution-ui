// TODO: Move to shared libs folder ??

import { AppConfig } from '@/datatypes/types';
import i18n from '@/i18n';
import CryptoJS from 'crypto-js';

export const translateKey = (key: string, variables = {}) => i18n.t(key, variables);

export const getFromPathName = (pathname: string, index: number) => `${pathname.split('/')[index]}`;

export const decryptPassword = ({ data, key }: { data: string; key: string }) => {
  const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(data, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const findAppConfigByName = (appConfig: AppConfig[], entryName: string) =>
  appConfig.find(({ name }) => name === entryName);
