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

import sortNumber from '@libs/common/utils/sortNumber';
import SurveyDto from '@libs/survey/types/api/survey.dto';

const sortSurveyByInvitesAndParticipation = (a?: SurveyDto, b?: SurveyDto): number => {
  const byAttendees = sortNumber(a?.invitedAttendees.length, b?.invitedAttendees.length);
  if (byAttendees !== 0) {
    return byAttendees;
  }
  return sortNumber(a?.participatedAttendees.length, b?.participatedAttendees.length);
};

export default sortSurveyByInvitesAndParticipation;
