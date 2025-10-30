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

import SurveyQuestionChoiceTypes from '@libs/survey/constants/surveyQuestionChoiceTypes';
import SurveyQuestionMatrixTypes from '@libs/survey/constants/surveyQuestionMatrixTypes';
import SurveyQuestionImageTypes from '@libs/survey/constants/surveyQuestionImageTypes';
import SurveyQuestionOtherTypes from '@libs/survey/constants/surveyQuestionOtherTypes';

type ChoiceType = (typeof SurveyQuestionChoiceTypes)[keyof typeof SurveyQuestionChoiceTypes];
type MatrixType = (typeof SurveyQuestionMatrixTypes)[keyof typeof SurveyQuestionMatrixTypes];
type ImageType = (typeof SurveyQuestionImageTypes)[keyof typeof SurveyQuestionImageTypes];
type OtherType = (typeof SurveyQuestionOtherTypes)[keyof typeof SurveyQuestionOtherTypes];

type TSurveyQuestionTypes = ChoiceType | MatrixType | ImageType | OtherType;

export default TSurveyQuestionTypes;
