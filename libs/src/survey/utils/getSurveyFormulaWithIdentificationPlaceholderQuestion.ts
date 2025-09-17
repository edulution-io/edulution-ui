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

import SurveyQuestionsType from '@libs/survey/constants/surveyQuestionsType';
import SurveyFormula from '@libs/survey/types/SurveyFormula';

const getSurveyFormulaWithIdentificationPlaceholderQuestion = (formula: SurveyFormula) => {
  const updatedFormula = structuredClone(formula);
  const identification = { type: SurveyQuestionsType.TEXT, name: 'identification', value: '' };

  if (Array.isArray(updatedFormula.pages) && updatedFormula.pages.length > 0) {
    updatedFormula.pages[0].elements = [identification, ...(updatedFormula.pages[0].elements ?? [])];
  } else {
    updatedFormula.elements = [identification, ...(updatedFormula.elements ?? [])];
  }

  return updatedFormula;
};

export default getSurveyFormulaWithIdentificationPlaceholderQuestion;
