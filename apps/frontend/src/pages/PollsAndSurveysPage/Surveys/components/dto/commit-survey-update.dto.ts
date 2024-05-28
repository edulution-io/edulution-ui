import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';
import Attendee from '@/pages/ConferencePage/dto/attendee';

async function commitSurveyUpdate(
  surveyName: string,
  surveyFormula: string,
  surveyParticipants: Attendee[],
  saveNo?: number,
  created?: Date,
) {
  try {
    return await eduApi.post<Survey>(SURVEY_ENDPOINT, {
      surveyname: surveyName,
      participants: surveyParticipants,
      survey: surveyFormula,
      saveNo,
      created,
      isAnonymous: false,
      isAnswerChangeable: false,
    });
  } catch (error) {
    console.error('ERROR saving and updating the survey in the db: ', error);
    return error;
  }
}

export default commitSurveyUpdate;
