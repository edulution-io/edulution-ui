import mongoose from 'mongoose';
import { Group } from '@libs/user/types/groups/group';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

class InitialSurveyForm implements SurveyDto {
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

  constructor(creator: AttendeeDto, selectedSurvey?: SurveyDto) {
    const time = new Date().getTime();
    this.id = selectedSurvey?.id || mongoose.Types.ObjectId.createFromTime(time);
    this.formula = selectedSurvey?.formula || ({} as JSON);
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
