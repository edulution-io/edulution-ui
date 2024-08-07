type MailProviderConfigDto = {
  id: string;
  name: string;
  label: string;
  host: string;
  port: number | null;
  secure: boolean;
};

export default MailProviderConfigDto;
