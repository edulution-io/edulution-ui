import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import FileSharingErrorMessage from '@libs/filesharing/fileSharingErrorMessage';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | AuthErrorMessages | FileSharingErrorMessage;

export default ErrorMessage;
