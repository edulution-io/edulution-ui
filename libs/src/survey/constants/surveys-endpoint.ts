/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
export const FILES = 'files';
export const SURVEYS_LOGO = 'surveys-logo';
export const TEMPLATES = 'templates';
export const CHOICES = 'choices';
export const CAN_PARTICIPATE = 'can-participate';
export const HAS_ANSWERS = 'has-answers';
export const PUBLIC_USER = 'public-user';

export const SURVEY_FIND_ONE_ENDPOINT = `${SURVEYS}/${FIND_ONE}`;
export const SURVEY_ANSWER_ENDPOINT = `${SURVEYS}/${ANSWER}`;
export const SURVEY_CHOICES = `${PUBLIC_SURVEYS}/${CHOICES}`;
export const SURVEY_RESULT_ENDPOINT = `${SURVEYS}/${RESULT}`;
export const SURVEY_FILE_ATTACHMENT_ENDPOINT = `${PUBLIC_SURVEYS}/${FILES}`;
export const SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT = `${SURVEYS}/${FILES}`;
export const SURVEY_TEMPLATES_ENDPOINT = `${SURVEYS}/${TEMPLATES}`;
export const SURVEY_CAN_PARTICIPATE_ENDPOINT = `${SURVEYS}/${CAN_PARTICIPATE}`;
export const SURVEY_HAS_ANSWERS_ENDPOINT = `${SURVEYS}/${HAS_ANSWERS}`;
