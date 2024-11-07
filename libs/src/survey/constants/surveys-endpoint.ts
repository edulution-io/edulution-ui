import SurveysPageView from '@libs/survey/types/api/page-view';

export const SURVEYS = 'surveys';
const SURVEYS_ENDPOINT = `${SURVEYS}`;

export const OPEN_SURVEYS_PAGE = `${SURVEYS_ENDPOINT}/${SurveysPageView.OPEN}`;
export const ANSWERED_SURVEYS_PAGE = `${SURVEYS_ENDPOINT}/${SurveysPageView.ANSWERED}`;
export const CREATED_SURVEYS_PAGE = `${SURVEYS_ENDPOINT}/${SurveysPageView.CREATED}`;
export const CREATOR_SURVEYS_PAGE = `${SURVEYS_ENDPOINT}/${SurveysPageView.CREATOR}`;
export const EDIT_SURVEY_PAGE = `${SURVEYS_ENDPOINT}/${SurveysPageView.EDITOR}`;
export const PARTICIPATE_SURVEY_PAGE = `${SURVEYS_ENDPOINT}/${SurveysPageView.PARTICIPATION}`;

export const FIND_ONE_ENDPOINT = 'id';
export const ANSWER_ENDPOINT = 'answers';
export const RESULT_ENDPOINT = 'results';
export const RESTFUL_CHOICES_ENDPOINT = 'choices';

export const FIND_SURVEYS_ENDPOINT = `${SURVEYS_ENDPOINT}/${FIND_ONE_ENDPOINT}`;
export const SURVEY_ANSWER_ENDPOINT = `${SURVEYS_ENDPOINT}/${ANSWER_ENDPOINT}`;
export const SURVEY_RESULT_ENDPOINT = `${SURVEYS_ENDPOINT}/${RESULT_ENDPOINT}`;

export const PUBLIC_SURVEYS_ENDPOINT = `public-surveys`;

export default SURVEYS_ENDPOINT;
