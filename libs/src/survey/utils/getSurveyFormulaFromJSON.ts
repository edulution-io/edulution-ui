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

import { t } from 'i18next';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { toast } from 'sonner';
import isSurveyPage from '@libs/survey/utils/isSurveyPage';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isValidSurveyFormula = (surveyFormula: TSurveyFormula): boolean => {
  const { title, pages, elements } = surveyFormula;
  if (pages) {
    return pages.every(isSurveyPage);
  }
  if (elements) {
    return elements.every(isSurveyElement);
  }
  return !!title;
};

const getSurveyFormulaFromJSON = (formula: JSON): TSurveyFormula => {
  try {
    const typedFormula = formula as unknown as TSurveyFormula;

    const isValidFormula = isValidSurveyFormula(typedFormula);
    if (isValidFormula) {
      return typedFormula;
    }
  } catch (error) {
    toast.error(t(SurveyErrorMessages.SurveyFormulaStructuralError));
  }

  return { title: t('survey.newTitle').toString() };
};

export default getSurveyFormulaFromJSON;
