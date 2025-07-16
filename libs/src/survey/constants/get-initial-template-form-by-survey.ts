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
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';

const getInitialTemplateFormBySurvey = (survey: SurveyDto, template?: SurveyTemplateDto): SurveyTemplateDto => ({
  template: {
    formula: survey.formula || { title: i18next.t('survey.newTitle').toString() },
    invitedAttendees: survey.invitedAttendees || [],
    invitedGroups: survey.invitedGroups || [],
    isPublic: survey.isPublic ?? false,
    isAnonymous: survey.isAnonymous ?? false,
    canSubmitMultipleAnswers: survey.canSubmitMultipleAnswers ?? false,
    canUpdateFormerAnswer: survey.canUpdateFormerAnswer ?? false,
  },
  backendLimiters: survey?.backendLimiters || [],
  fileName: template?.fileName || undefined,
  title: template?.title || undefined,
  description: template?.description || undefined,
  isActive: template?.isActive ?? true,
  createdAt: template?.createdAt || new Date(),
  updatedAt: new Date(),
});

export default getInitialTemplateFormBySurvey;
