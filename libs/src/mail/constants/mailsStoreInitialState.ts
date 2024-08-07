import MailsStore from '@libs/mail/types/mailsStore';

const MailStoreInitialState: Partial<MailsStore> = {
  mails: [],
  isLoading: false,
};

export default MailStoreInitialState;
