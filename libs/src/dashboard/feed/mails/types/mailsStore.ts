import MailDto from '@libs/dashboard/feed/mails/types/mail.dto';

interface MailStore {
  mails: MailDto[];
  getMails: () => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

export default MailStore;
