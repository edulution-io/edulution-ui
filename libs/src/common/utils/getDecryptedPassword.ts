import CryptoJS from 'crypto-js';

const getDecryptedPassword = (data: string, secret: string) => {
  const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(data, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export default getDecryptedPassword;
