import MailsStore from '@libs/dashboard/feed/mails/types/mailsStore';

const MailStoreInitialState: Partial<MailsStore> = {
  mails: [],
  isLoading: false,
};

export default MailStoreInitialState;
