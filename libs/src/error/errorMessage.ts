import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';

type ErrorMessage =
  | CommonErrorMessages
  | UserErrorMessages
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | LmnApiErrorMessage
  | AppConfigErrorMessages
  | FileSharingErrorMessage;

export default ErrorMessage;
