import Attendee from '@/pages/ConferencePage/dto/attendee';

interface EditPollFormData {
  pollName: string;
  pollFormula: string | undefined;
  participants: Attendee[];
  saveNo: number | undefined,
  created: Date;
}

export default EditPollFormData;
