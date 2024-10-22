enum SurveyErrorMessages {
  UpdateOrCreateError = 'survey.errors.updateOrCreateError',
  DeleteError = 'survey.errors.deleteError',
  NoAnswers = 'survey.errors.noAnswerError',
  NoFormula = 'survey.errors.noFormulaError',
  NoBackendLimiters = 'survey.errors.noBackendLimitersError',
  NotFoundError = 'survey.errors.notFoundError',
  IdTypeError = 'survey.errors.idTypeError',
  ParticipationErrorUserNotAssigned = 'survey.errors.participationErrorUserNotAssigned',
  ParticipationErrorSurveyExpired = 'survey.errors.participationErrorSurveyExpired',
  ParticipationErrorAlreadyParticipated = 'survey.errors.participationErrorAlreadyParticipated',
  PermissionDenied = 'survey.errors.permissionDeniedError',
}

export default SurveyErrorMessages;
