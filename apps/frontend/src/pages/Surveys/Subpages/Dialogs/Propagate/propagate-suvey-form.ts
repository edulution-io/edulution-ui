import Attendee from '@/pages/ConferencePage/dto/attendee.ts';
import Group from '@/pages/ConferencePage/dto/group';

interface PropagateSurveyFormData {
  participants: Attendee[];
  invitedGroups: Group[];
}

export default PropagateSurveyFormData;
