import Attendee from '@/pages/ConferencePage/dto/attendee';
import Group from '@/pages/ConferencePage/dto/group';

interface SurveyEditorForm {
  id: number;
  formula: JSON;
  participants: Attendee[];
  participated: string[];
  saveNo: number;
  created?: Date;
  expirationDate?: Date;
  expirationTime?: string;
  isAnonymous?: boolean;
  invitedGroups: Group[];

  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default SurveyEditorForm;
