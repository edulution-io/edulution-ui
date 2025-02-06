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
  expires?: Date;
  isAnonymous?: boolean;
  isPublic?: boolean;
  canSubmitMultipleAnswers?: boolean;
}

export default SurveyDto;
