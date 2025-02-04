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
import i18next from 'i18next';
import { Group } from '@libs/groups/types/group';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import AttendeeDto from '@libs/user/types/attendee.dto';
import getNewSurveyId from '@libs/survey/getNewSurveyId';

class InitialSurveyForm implements SurveyDto {
  readonly id: mongoose.Types.ObjectId;

  formula: TSurveyFormula;

  saveNo: number;

  creator: AttendeeDto;

  invitedAttendees: AttendeeDto[];

  invitedGroups: Group[];

  participatedAttendees: AttendeeDto[];

  answers: mongoose.Types.ObjectId[];

  created: Date;

  expires: Date | undefined;

  isAnonymous: boolean;

  canSubmitMultipleAnswers: boolean;

  canShowResultsTable: boolean;

  canShowResultsChart: boolean;

  constructor(creator: AttendeeDto, selectedSurvey?: SurveyDto) {
    this.id = selectedSurvey?.id || getNewSurveyId();
    this.formula = selectedSurvey?.formula || { title: i18next.t('survey.newTitle').toString() };
    this.saveNo = selectedSurvey?.saveNo || 0;
    this.creator = creator;
    this.invitedAttendees = selectedSurvey?.invitedAttendees || [];
    this.invitedGroups = [];
    this.participatedAttendees = selectedSurvey?.participatedAttendees || [];
    this.answers = selectedSurvey?.answers || [];
    this.created = selectedSurvey?.created || new Date();
    this.expires = selectedSurvey?.expires || undefined;
    this.isAnonymous = selectedSurvey?.isAnonymous || false;
    this.canSubmitMultipleAnswers = selectedSurvey?.canSubmitMultipleAnswers || false;

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default InitialSurveyForm;
