import mongoose from 'mongoose';
import { Group } from '@libs/user/types/groups/group';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

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
    const time = new Date().getTime();
    this.id = mongoose.Types.ObjectId.createFromTime(time);
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
