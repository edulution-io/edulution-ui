import MailProviderConfigDto from './mailProviderConfig.dto';

interface MailsStore {
  externalMailProviderConfig: MailProviderConfigDto[];
  getExternalMailProviderConfig: () => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

export default MailsStore;
