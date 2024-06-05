import Attendee from '@/pages/ConferencePage/dto/attendee';
import Group from '@/pages/ConferencePage/dto/group';

interface EditorFormData {
  surveyname: string;
  survey: string | undefined;
  saveNo: number | undefined;
  participants: Attendee[];
  created?: Date;
  expires?: Date;
  isAnonymous?: boolean;
  canSubmitMultipleAnswers?: boolean;
  invitedGroups: Group[];
}

export default EditorFormData;
