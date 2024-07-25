import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | AuthErrorMessages | VdiErrorMessages | AppConfigErrorMessages ;

export default ErrorMessage;
