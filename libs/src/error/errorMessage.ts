import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import UserErrorMessages from '@libs/user/user-error-messages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import FileSharingErrorMessage from '@libs/filesharing/fileSharingErrorMessage';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/survey-answer-error-messages';

type ErrorMessage =
  | AuthErrorMessages
  | UserErrorMessages
  | GroupsErrorMessage
  | VdiErrorMessages
  | ConferencesErrorMessage
  | FileSharingErrorMessage
  | SurveyErrorMessages
  | SurveyAnswerErrorMessages;

export default ErrorMessage;
