import MailDto from '@libs/mail/types/mail.dto';

interface MailsStore {
  mails: MailDto[];
  getMails: () => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

export default MailsStore;
