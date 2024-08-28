import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import SurveyErrorMessagesEnum from '@libs/survey/constants/api/survey-error-messages-enum';
import SurveyAnswerErrorMessages from '@libs/survey/constants/api/survey-answer-error-messages-enum';

type ErrorMessage =
  | CommonErrorMessages
  | UserErrorMessages
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | AppConfigErrorMessages
  | FileSharingErrorMessage
  | SurveyErrorMessagesEnum
  | SurveyAnswerErrorMessages;

export default ErrorMessage;
