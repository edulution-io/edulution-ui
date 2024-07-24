import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import UserErrorMessages from '@libs/user/user-error-messages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/survey-answer-error-messages';

type ErrorMessage =
  | AuthErrorMessages
  | UserErrorMessages
  | GroupsErrorMessage
  | VdiErrorMessages
  | ConferencesErrorMessage
  | SurveyErrorMessages
  | SurveyAnswerErrorMessages;

export default ErrorMessage;
