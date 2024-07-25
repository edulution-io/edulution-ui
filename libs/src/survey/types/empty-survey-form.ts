import mongoose from 'mongoose';
import { Group } from '@libs/user/types/groups/group';
import SurveyDto from '@libs/survey/types/survey.dto';
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

  expirationDate: Date | undefined;

  expirationTime: string | undefined;

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
    this.expirationDate = undefined;
    this.expirationTime = undefined;
    this.isAnonymous = false;
    this.canSubmitMultipleAnswers = false;

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default EmptySurveyForm;
