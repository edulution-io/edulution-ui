export const SURVEYS = 'surveys';
const SURVEYS_ENDPOINT = `${SURVEYS}/`;

export const FIND_ONE_ENDPOINT = 'id/';
export const ANSWER_ENDPOINT = 'answers/';
export const RESULT_ENDPOINT = 'results/';
export const RESTFUL_CHOICES_ENDPOINT = 'choices';

export const FIND_SURVEYS_ENDPOINT = `${SURVEYS_ENDPOINT}${FIND_ONE_ENDPOINT}`;
export const SURVEY_ANSWER_ENDPOINT = `${SURVEYS_ENDPOINT}${ANSWER_ENDPOINT}`;
export const SURVEY_RESULT_ENDPOINT = `${SURVEYS_ENDPOINT}${RESULT_ENDPOINT}`;

export const PUBLIC_SURVEYS_ENDPOINT = `public-surveys`;

export default SURVEYS_ENDPOINT;
