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

import isSurveyPage from '@libs/survey/utils/isSurveyPage';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isSurveyFormula = (surveyFormula: TSurveyFormula): boolean => {
  // TODO: NIEDUUI-209: Add validation to make the Title mandatory
  const { title, pages, elements } = surveyFormula;
  if (pages) {
    return pages.every(isSurveyPage);
  }
  if (elements) {
    return elements.every(isSurveyElement);
  }
  return !!title;
};

export default isSurveyFormula;
