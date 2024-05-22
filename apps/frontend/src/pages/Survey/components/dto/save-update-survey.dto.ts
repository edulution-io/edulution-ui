import eduApi from '@/api/eduApi';
import { Survey, SurveyType } from '@/pages/Survey/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/Survey/components/dto/survey-endpoint.dto';
import Attendee from '@/pages/ConferencePage/dto/attendee';

async function saveSurveyJson(
  surveyName: string,
  surveyFormula: JSON,
  surveyParticipants: Attendee[],
  saveNo: number,
  callback: (saNo: number, b: boolean) => Promise<void>,
) {
  try {
    const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, {
      surveyname: surveyName,
      participants: surveyParticipants,
      survey: surveyFormula,
      type: SurveyType.FORMS,
      isAnonymous: false,
      isAnswerChangeable: false,
    });
    if (response.status === 200 || response.status === 201) {
      callback(saveNo, true);
    } else {
      callback(saveNo, false);
    }
  } catch (error) {
    console.error('ERROR saving and updating the survey in the db: ', error);
    callback(saveNo, false);
  }
}

export default saveSurveyJson;
