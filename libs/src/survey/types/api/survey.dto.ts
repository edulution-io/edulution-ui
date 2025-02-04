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

import mongoose from 'mongoose';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import { Group } from '@libs/groups/types/group';
import AttendeeDto from '@libs/user/types/attendee.dto';
import ChoiceDto from '@libs/survey/types/api/choice.dto';

interface SurveyDto {
  id: mongoose.Types.ObjectId;
  formula: TSurveyFormula;
  backendLimiters?: {
    questionId: string;
    choices: ChoiceDto[];
  }[];
  saveNo: number;
  creator: AttendeeDto;
  invitedAttendees: AttendeeDto[];
  invitedGroups: Group[];
  participatedAttendees: AttendeeDto[];
  answers: mongoose.Types.ObjectId[];
  created?: Date;
  expires?: Date;
  isAnonymous?: boolean;
  isPublic?: boolean;
  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;
  canSubmitMultipleAnswers?: boolean;
}

export default SurveyDto;
