import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | AuthErrorMessages | LmnApiErrorMessage;

export default ErrorMessage;
