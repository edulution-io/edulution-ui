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

const getInitialSurveyFormValues = (
  creator: AttendeeDto,
  selectedSurvey?: SurveyDto,
  storedSurvey?: SurveyDto,
): SurveyDto => {
  let expiresDate = storedSurvey?.expires ? new Date(storedSurvey?.expires) : undefined;
  if (!expiresDate || Number.isNaN(expiresDate.getTime())) {
    expiresDate = selectedSurvey?.expires ? new Date(selectedSurvey?.expires) : undefined;
  }

  return {
    id: storedSurvey?.id || selectedSurvey?.id,
    formula: storedSurvey?.formula || selectedSurvey?.formula || { title: i18next.t('survey.newTitle').toString() },
    saveNo: storedSurvey?.saveNo || selectedSurvey?.saveNo || 0,
    creator,
    invitedAttendees: storedSurvey?.invitedAttendees || selectedSurvey?.invitedAttendees || [],
    invitedGroups: storedSurvey?.invitedGroups || selectedSurvey?.invitedGroups || [],
    participatedAttendees: storedSurvey?.participatedAttendees || selectedSurvey?.participatedAttendees || [],
    answers: selectedSurvey?.answers || selectedSurvey?.answers || [],
    createdAt: selectedSurvey?.createdAt || selectedSurvey?.createdAt || new Date(),
    expires: expiresDate && !Number.isNaN(expiresDate.getTime()) ? expiresDate : undefined,
    isAnonymous: selectedSurvey?.isAnonymous || false,
    canSubmitMultipleAnswers: selectedSurvey?.canSubmitMultipleAnswers || false,
    isPublic: selectedSurvey?.isPublic || false,
    canUpdateFormerAnswer: selectedSurvey?.canUpdateFormerAnswer || false,
  };
};

export default getInitialSurveyFormValues;
