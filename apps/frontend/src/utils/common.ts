import i18n from '@/i18n';
import CryptoJS from 'crypto-js';

export const translateKey = (key: string) => i18n.t(key);

export const getFromPathName = (pathname: string, index: number) => `${pathname.split('/')[index]}`;

export const decryptPassword = ({ data, key }: { data: string; key: string }) => {
  const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(data, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
