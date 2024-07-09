import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessage from '@libs/desktopdeployment/types/vdiErrorMessages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | AuthErrorMessages | VdiErrorMessage;

export default ErrorMessage;
