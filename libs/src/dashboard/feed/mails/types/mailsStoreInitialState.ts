import MailStore from '@libs/dashboard/feed/mails/types/mailsStore';

const MailStoreInitialState: Partial<MailStore> = {
  mails: [],
  isLoading: false,
};

export default MailStoreInitialState;
