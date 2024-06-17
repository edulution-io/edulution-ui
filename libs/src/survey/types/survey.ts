import Attendee from '@libs/conferences/types/attendee';

interface Survey {
  id: number;
  formula: JSON;
  publicAnswers: JSON[];
  participants: Attendee[];
  participated: string[];
  saveNo: number;
  created?: Date;
  expirationDate?: Date;
  expirationTime?: string;
  isAnonymous?: boolean;

  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default Survey;
