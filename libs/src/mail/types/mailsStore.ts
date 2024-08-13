import MailDto from '@libs/mail/types/mail.dto';
import MailProviderConfigDto from './mailProviderConfig.dto';

interface MailsStore {
  mails: MailDto[];
  getMails: () => Promise<void>;
  externalMailProviderConfig: MailProviderConfigDto[];
  getExternalMailProviderConfig: () => Promise<void>;
  postExternalMailProviderConfig: (mailProviderConfig: MailProviderConfigDto) => Promise<void>;
  deleteExternalMailProviderConfig: (mailProviderId: string) => Promise<void>;
  error: Error | null;
  isLoading: boolean;
  reset: () => void;
}

export default MailsStore;
