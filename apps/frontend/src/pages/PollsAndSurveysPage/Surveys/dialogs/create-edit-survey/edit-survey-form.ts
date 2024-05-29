import Attendee from '@/pages/ConferencePage/dto/attendee';

interface EditSurveyFormData {
  surveyname: string;
  survey: string | undefined;
  saveNo: number | undefined,
  participants: Attendee[];
  created?: Date;
}

export default EditSurveyFormData;
