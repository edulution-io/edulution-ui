const MailStoreInitialState = {
  mails: [],
  isLoading: false,
  isGetSyncJobLoading: false,
  isEditSyncJobLoading: false,
  externalMailProviderConfig: [],
  error: null,
  reset: () => {},
  syncJobs: [],
  selectedSyncJob: {},
};

export default MailStoreInitialState;
