// TODO: Refactor errors when error handling is implemented [MERGE WITH GLOBAL ENUM FOR ERROR MESSAGES/TRANSLATIONS]

enum SurveyErrors {
  NeitherAbleToUpdateNorToCreateSurveyError = 'errors.neitherAbleToUpdateNorToCreateSurveyError',
  NotAbleToCreateSurveyError = 'errors.notAbleToCreateSurveyError',
  NotAbleToDeleteSurveyError = 'errors.notAbleToDeleteSurveyError',
  NotAbleToFindSurveyAnswerError = 'errors.notAbleToFindSurveyAnswerError',
  NotAbleToFindSurveyError = 'errors.notAbleToFindSurveyError',
  NotAbleToFindSurveysError = 'errors.notAbleToFindSurveysError',
  NotAbleToFindUserError = 'errors.notAbleToFindUserError',
  NotAbleToFindUsersError = 'errors.notAbleToFindUsersError',
  NotAbleToParticipateNotAnParticipantError = 'errors.notAbleToParticipateNotAnParticipantError',
  NotAbleToParticipateAlreadyParticipatedError = 'errors.notAbleToParticipateAlreadyParticipatedError',
  NotAbleToUpdateSurveyError = 'errors.notAbleToUpdateSurveyError',
  NotAbleToUpdateUserError = 'errors.notAbleToUpdateUserError',
  NotValidSurveyIdIsNoMongooseObjectId = 'errors.notValidSurveyIdIsNoMongooseObjectId',
}

export default SurveyErrors;
