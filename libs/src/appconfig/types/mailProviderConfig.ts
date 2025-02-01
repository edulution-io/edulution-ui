import { type TMailEncryption } from '@libs/mail/types';

type MailProviderConfig = {
  mail: {
    mailProviderId: string;
    configName: string;
    hostname: string;
    port: string;
    encryption: TMailEncryption;
  };
};

export default MailProviderConfig;
