import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import LicenseErrorMessages from '@libs/license/license-error-messages';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | AuthErrorMessages | LicenseErrorMessages;

export default ErrorMessage;
