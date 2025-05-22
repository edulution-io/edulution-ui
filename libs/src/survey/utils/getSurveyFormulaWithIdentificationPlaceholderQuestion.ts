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

import TSurveyFormula from '@libs/survey/types/TSurveyFormula';

const getSurveyFormulaWithIdentificationPlaceholderQuestion = (formula: TSurveyFormula) => {
  const identification = { type: 'text', name: 'identification' };
  const updatedFormula = JSON.parse(JSON.stringify(formula)) as TSurveyFormula;
  const { pages, elements } = updatedFormula;
  if (updatedFormula.pages && pages && pages.length > 0) {
    const existingElements = pages[0].elements || [];
    updatedFormula.pages[0].elements = [identification, ...existingElements];
  } else {
    const existingElements = elements || [];
    updatedFormula.elements = [identification, ...existingElements];
  }
  return updatedFormula;
};

export default getSurveyFormulaWithIdentificationPlaceholderQuestion;
