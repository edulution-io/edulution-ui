enum ConferencesErrorMessage {
  MeetingNotFound = 'conferences.errors.MeetingNotFound',
  BbbServerNotReachable = 'conferences.errors.BbbServerNotReachable',
  BbbUnauthorized = 'conferences.errors.BbbUnauthorized',
  AppNotProperlyConfigured = 'conferences.errors.AppNotProperlyConfigured',
  YouAreNotTheCreator = 'conferences.errors.YouAreNotTheCreator',
  AlreadyInAnotherMeeting = 'conferences.errors.AlreadyInAnotherMeeting',
  DBAccessFailed = 'conferences.errors.DBAccessFailed',
  WrongPassword = 'conferences.errors.WrongPassword',
  ConferenceIsNotRunning = 'conferences.errors.ConferenceIsNotRunning',
  MissingMandatoryParameters = 'conferences.errors.MissingMandatoryParameters',
}

export default ConferencesErrorMessage;
