import mongoose from 'mongoose';
import { Group } from '@libs/groups/types/group';
import AttendeeDto from '@libs/user/types/attendee.dto';
import ChoiceDto from '@libs/survey/types/api/choice.dto';

interface SurveyDto {
  id: mongoose.Types.ObjectId;
  formula: JSON;
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
