import MailsStore from '@libs/mail/types/mailsStore';

const MailStoreInitialState: Partial<MailsStore> = {
  mails: [],
  isLoading: false,
  externalMailProviderConfig: [],
  error: null,
  reset: () => {},
};

export default MailStoreInitialState;
