import Attendee from '@/pages/ConferencePage/dto/attendee';

interface EditorFormData {
  surveyname: string;
  survey: string | undefined;
  saveNo: number | undefined;
  participants: Attendee[];
  created?: Date;
  expires?: Date;
  isAnonymous?: boolean;
  canSubmitMultipleAnswers?: boolean;
}

export default EditorFormData;
