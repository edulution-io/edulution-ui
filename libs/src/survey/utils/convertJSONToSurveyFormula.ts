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
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import isSurveyFormula from '@libs/survey/utils/isSurveyFormula';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { toast } from 'sonner';

const convertJSONToSurveyFormula = (formula: JSON): SurveyFormula => {
  try {
    const typedFormula = formula as unknown as SurveyFormula;
    const isValidFormula = isSurveyFormula(typedFormula);
    if (isValidFormula) {
      return typedFormula;
    }
  } catch (error) {
    toast.error(t(SurveyErrorMessages.SurveyFormulaStructuralError));
  }

  return { title: t('survey.newTitle').toString() };
};

export default convertJSONToSurveyFormula;
