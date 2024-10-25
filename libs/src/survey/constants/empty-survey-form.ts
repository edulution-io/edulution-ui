import mongoose from 'mongoose';
import { Group } from '@libs/groups/types/group';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import getNewSurveyId from '@libs/survey/getNewSurveyId';

class EmptySurveyForm implements SurveyDto {
  readonly id: mongoose.Types.ObjectId;

  formula: JSON;

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

  constructor(creator: AttendeeDto) {
    this.id = getNewSurveyId();
    this.formula = {} as JSON;
    this.saveNo = 0;
    this.creator = creator;
    this.invitedAttendees = [];
    this.invitedGroups = [];
    this.participatedAttendees = [];
    this.answers = [];
    this.created = new Date();
    this.expires = undefined;
    this.isAnonymous = false;
    this.canSubmitMultipleAnswers = false;

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default EmptySurveyForm;
