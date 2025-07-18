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

import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import surveysDefaultValues from '@libs/survey/constants/surveys-default-values';

const getInitialSurveyFormByTemplate = (creator: AttendeeDto, template?: SurveyTemplateDto): SurveyDto => ({
  id: undefined,
  formula: template?.template.formula || surveysDefaultValues.formula,
  backendLimiters: template?.backendLimiters || [],
  creator,
  invitedAttendees: template?.template.invitedAttendees || [],
  invitedGroups: template?.template.invitedGroups || [],
  participatedAttendees: template?.template.participatedAttendees || [],
  saveNo: 0,
  answers: [],
  createdAt: new Date(),
  expires: null,
  isAnonymous: template?.template.isAnonymous ?? surveysDefaultValues.isAnonymous,
  canSubmitMultipleAnswers:
    template?.template.canSubmitMultipleAnswers ?? surveysDefaultValues.canSubmitMultipleAnswers,
  isPublic: template?.template.isPublic ?? surveysDefaultValues.isPublic,
  canUpdateFormerAnswer: template?.template.canUpdateFormerAnswer ?? surveysDefaultValues.canUpdateFormerAnswer,
});

export default getInitialSurveyFormByTemplate;
