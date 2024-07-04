import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | AuthErrorMessages;

export default ErrorMessage;
