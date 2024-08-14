const MailStoreInitialState = {
  mails: [],
  isLoading: false,
  externalMailProviderConfig: [],
  error: null,
  reset: () => {},
  syncJobs: [],
  selectedSyncJob: {},
};

export default MailStoreInitialState;
