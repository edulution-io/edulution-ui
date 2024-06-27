import UserErrorMessages from '@libs/user/user-error-messages';
import ConferencesErrorMessage from '@libs/conferences/conferencesErrorMessage';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

type ErrorMessage = UserErrorMessages | ConferencesErrorMessage | SurveyErrorMessages;

export default ErrorMessage;
