import SurveysPageView from '@libs/survey/types/api/page-view';

export const SURVEYS = 'surveys';
export const PUBLIC_SURVEYS = `public-surveys`;

export const OPEN_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.OPEN}`;
export const ANSWERED_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.ANSWERED}`;
export const CREATED_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.CREATED}`;
export const CREATOR_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.CREATOR}`;
export const EDIT_SURVEY_PAGE = `${SURVEYS}/${SurveysPageView.EDITOR}`;
export const PARTICIPATE_SURVEY_PAGE = `${SURVEYS}/${SurveysPageView.PARTICIPATION}`;

export const FIND_ONE = 'id';
export const ANSWER = 'answers';
export const RESULT = 'results';
export const RESTFUL_CHOICES = 'choices';
export const CAN_PARTICIPATE = 'can-participate';
export const HAS_ANSWERS = 'has-answers';

export const SURVEY_FIND_ONE_ENDPOINT = `${SURVEYS}/${FIND_ONE}`;
export const SURVEY_ANSWER_ENDPOINT = `${SURVEYS}/${ANSWER}`;
export const SURVEY_RESULT_ENDPOINT = `${SURVEYS}/${RESULT}`;
export const SURVEY_CAN_PARTICIPATE_ENDPOINT = `${SURVEYS}/${CAN_PARTICIPATE}`;
export const SURVEY_HAS_ANSWERS_ENDPOINT = `${SURVEYS}/${HAS_ANSWERS}`;
