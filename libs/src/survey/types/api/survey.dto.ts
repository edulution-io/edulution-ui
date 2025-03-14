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
import AttendeeDto from '@libs/user/types/attendee.dto';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

interface SurveyDto {
  id?: string;
  formula: TSurveyFormula;
  backendLimiters?: {
    questionId: string;
    choices: ChoiceDto[];
  }[];
  saveNo: number;
  creator: AttendeeDto;
  invitedAttendees: AttendeeDto[];
  invitedGroups: MultipleSelectorGroup[];
  participatedAttendees: AttendeeDto[];
  answers: string[];
  createdAt?: Date;
  expires?: Date | null;
  isAnonymous?: boolean;
  isPublic?: boolean;
  canSubmitMultipleAnswers?: boolean;
  canUpdateFormerAnswer?: boolean;
}

export default SurveyDto;
