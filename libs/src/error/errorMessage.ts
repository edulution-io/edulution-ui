import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import AuthErrorMessages from '@libs/auth/authErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import ImapErrorMessages from '@libs/dashboard/constants/imap-error-messages';

type ErrorMessage =
  | CommonErrorMessages
  | UserErrorMessages
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | AppConfigErrorMessages
  | FileSharingErrorMessage
  | ImapErrorMessages;

export default ErrorMessage;
