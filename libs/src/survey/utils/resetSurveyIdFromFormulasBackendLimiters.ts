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

import SurveyFormula from '@libs/survey/types/SurveyFormula';
import resetSurveyIdForRestfulChoices from '@libs/survey/utils/resetSurveyIdForRestfulChoices';

const resetSurveyIdFromFormulasBackendLimiters = (formula: SurveyFormula, surveyId?: string) => {
  if (!surveyId) {
    return formula;
  }

  if (formula.pages && formula.pages.length > 0) {
    const pages = formula.pages.map((page) => ({
      ...page,
      elements: resetSurveyIdForRestfulChoices(page.elements, surveyId),
    }));
    return { ...formula, pages };
  }

  if (formula.elements && formula.elements.length > 0) {
    const elements = resetSurveyIdForRestfulChoices(formula.elements, surveyId);
    return { ...formula, elements };
  }

  return formula;
};

export default resetSurveyIdFromFormulasBackendLimiters;
