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

import i18next from 'i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import { DEFAULT_FILES, PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_CUSTOM_LOGO from '@libs/survey/constants/surveys-custom-logo';

const surveysDefaultValues: Partial<SurveyDto> & { formula: SurveyFormula } = {
  formula: {
    title: i18next.t('survey.newTitle').toString(),
    logo: `${EDU_API_URL}/${PUBLIC_SURVEYS}/${DEFAULT_FILES}/${SURVEYS_CUSTOM_LOGO}`,
  },
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  isPublic: false,
  canUpdateFormerAnswer: false,
};

export default surveysDefaultValues;
