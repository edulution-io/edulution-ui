import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

type ErrorMessage = ConferencesErrorMessage | GroupsErrorMessage | SurveyErrorMessages;

export default ErrorMessage;
