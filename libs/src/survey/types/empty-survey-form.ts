import mongoose from 'mongoose';
import { Group } from '@libs/user/types/groups/group';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';

class EmptySurveyForm implements SurveyEditorFormData {
  participants: AttendeeDto[];

  invitedGroups: Group[];

  readonly id: mongoose.Types.ObjectId;

  formula: JSON;

  saveNo: number;

  created: Date;

  expirationDate: Date | undefined;

  expirationTime: string | undefined;

  isAnonymous: boolean;

  canSubmitMultipleAnswers: boolean;

  canShowResultsTable: boolean;

  canShowResultsChart: boolean;

  constructor() {
    this.participants = [];
    this.invitedGroups = [];

    const time = new Date().getTime();
    this.id = mongoose.Types.ObjectId.createFromTime(time);
    this.formula = {} as JSON;
    this.saveNo = 0;
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
