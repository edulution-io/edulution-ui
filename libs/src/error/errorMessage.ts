import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import LicenseErrorMessages from '@libs/license/license-error-messages';

type ErrorMessage =
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | LicenseErrorMessages;

export default ErrorMessage;
