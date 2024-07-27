import AuthErrorMessages from '@libs/auth/authErrorMessages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';

type ErrorMessage =
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | FileSharingErrorMessage;

export default ErrorMessage;
