enum ConferencesErrorMessage {
  MeetingNotFound = 'conferences.errors.MeetingNotFound',
  CouldNotStartConference = 'conferences.errors.CouldNotStartConference',
  CouldNotStopConference = 'conferences.errors.CouldNotStopConference',
  BbbServerNotReachable = 'conferences.errors.BbbServerNotReachable',
  BbbUnauthorized = 'conferences.errors.BbbUnauthorized',
  AppNotProperlyConfigured = 'conferences.errors.AppNotProperlyConfigured',
  YouAreNotTheCreator = 'conferences.errors.YouAreNotTheCreator',
  DBAccessFailed = 'conferences.errors.DBAccessFailed',
  WrongPassword = 'conferences.errors.WrongPassword',
  ConferenceIsNotRunning = 'conferences.errors.ConferenceIsNotRunning',
  MissingMandatoryParameters = 'conferences.errors.MissingMandatoryParameters',
}

export default ConferencesErrorMessage;
