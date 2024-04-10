import CryptoJS from 'crypto-js';

type CryptData = {
  mode: 'encrypt' | 'decrypt';
  data: string;
  key: string;
};

const useEncryption = ({ mode, data, key }: CryptData) => {
  if (mode === 'encrypt') {
    const encryptedValue = CryptoJS.AES.encrypt(data, key);
    return encryptedValue.toString();
  }
  const decryptedValue = CryptoJS.AES.decrypt(data, key);
  return decryptedValue.toString(CryptoJS.enc.Utf8);
};

export default useEncryption;
