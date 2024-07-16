import AuthErrorMessages from '@libs/auth/authErrorMessages';
import UserErrorMessages from '@libs/user/user-error-messages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/survey-answer-error-messages';

type ErrorMessage =
  | AuthErrorMessages
  | UserErrorMessages
  | GroupsErrorMessage
  | ConferencesErrorMessage
  | SurveyErrorMessages
  | SurveyAnswerErrorMessages;

export default ErrorMessage;
