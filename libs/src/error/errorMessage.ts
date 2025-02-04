import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import MailsErrorMessages from '@libs/mail/constants/mails-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import DockerErrorMessages from '@libs/docker/constants/dockerErrorMessages';
import VeyonErrorMessages from '@libs/veyon/types/veyonErrorMessages';
import LicenseErrorMessagesType from '@libs/license/types/licenseErrorMessagesType';

type ErrorMessage =
  | CommonErrorMessages
  | UserErrorMessages
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | LmnApiErrorMessage
  | AppConfigErrorMessages
  | FileSharingErrorMessage
  | MailsErrorMessages
  | SurveyErrorMessages
  | BulletinBoardErrorMessage
  | SurveyAnswerErrorMessages
  | DockerErrorMessages
  | VeyonErrorMessages
  | LicenseErrorMessagesType;

export default ErrorMessage;
