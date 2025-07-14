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
import AttendeeDto from '@libs/user/types/attendee.dto';
import getFirstValidDateOfArray from '@libs/common/utils/Date/getFirstValidDateOfArray';

const getInitialSurveyFormBySurveys = (
  creator: AttendeeDto,
  selectedSurvey?: SurveyDto,
  storedSurvey?: SurveyDto,
): SurveyDto => {
  const expiresDate = getFirstValidDateOfArray(storedSurvey?.expires, selectedSurvey?.expires);

  return {
    id: storedSurvey?.id || selectedSurvey?.id,
    formula: storedSurvey?.formula || selectedSurvey?.formula || { title: i18next.t('survey.newTitle').toString() },
    backendLimiters: storedSurvey?.backendLimiters || selectedSurvey?.backendLimiters || [],
    saveNo: storedSurvey?.saveNo || selectedSurvey?.saveNo || 0,
    creator,
    invitedAttendees: storedSurvey?.invitedAttendees || selectedSurvey?.invitedAttendees || [],
    invitedGroups: storedSurvey?.invitedGroups || selectedSurvey?.invitedGroups || [],
    participatedAttendees: storedSurvey?.participatedAttendees || selectedSurvey?.participatedAttendees || [],
    answers: storedSurvey?.answers || selectedSurvey?.answers || [],
    createdAt: storedSurvey?.createdAt || selectedSurvey?.createdAt || new Date(),
    expires: expiresDate,
    isAnonymous: storedSurvey?.isAnonymous ?? selectedSurvey?.isAnonymous ?? false,
    canSubmitMultipleAnswers:
      storedSurvey?.canSubmitMultipleAnswers ?? selectedSurvey?.canSubmitMultipleAnswers ?? false,
    isPublic: storedSurvey?.isPublic ?? selectedSurvey?.isPublic ?? false,
    canUpdateFormerAnswer: storedSurvey?.canUpdateFormerAnswer ?? selectedSurvey?.canUpdateFormerAnswer ?? false,
  };
};

export default getInitialSurveyFormBySurveys;
