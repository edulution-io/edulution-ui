import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import AuthErrorMessages from '@libs/auth/authErrorMessages';
import UserErrorMessages from '@libs/user/user-error-messages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import ImapErrorMessages from '@libs/dashboard/constants/imap-error-messages';

type ErrorMessage =
  | CommonErrorMessages
  | UserErrorMessages
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | ImapErrorMessages;

export default ErrorMessage;
