import mongoose from 'mongoose';
import { Group } from '@libs/user/types/groups/group';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface SurveyEditorFormData {
  // ADDITIONAL
  invitedGroups: Group[];
  participants: AttendeeDto[];

  // SURVEY
  id: mongoose.Types.ObjectId;
  formula: JSON;
  saveNo: number;
  created?: Date;
  expirationDate?: Date;
  expirationTime?: string;
  isAnonymous?: boolean;

  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default SurveyEditorFormData;
