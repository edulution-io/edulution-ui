import TMailEncryption from './mailEncryption.type';

type MailProviderConfigDto = {
  id: string;
  name: string;
  label: string;
  host: string;
  port: string;
  encryption: TMailEncryption;
};

export default MailProviderConfigDto;
