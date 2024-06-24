import Attendee from '@libs/conferences/types/attendee';
// import Group from '@libs/conferences/types/group';

interface SurveyEditorFormData {
  id: number;
  formula: JSON;
  participants: Attendee[];
  participated: string[];
  saveNo: number;
  created?: Date;
  expirationDate?: Date;
  expirationTime?: string;
  isAnonymous?: boolean;
  // invitedGroups: Group[];

  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;

  canSubmitMultipleAnswers?: boolean;

}

export default SurveyEditorFormData;
