import eduApi from '@/api/eduApi';
import { Survey, SurveyType } from '@/pages/Survey/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/Survey/Forms/dto/survey-endpoint.dto';

async function saveSurveyJson(
  surveyName: string,
  surveyFormula: JSON,
  saveNo: number,
  callback: (saNo: number, b: boolean) => Promise<void>,
) {
  try {
    const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, {
      surveyname: surveyName,
      participants: [],
      survey: surveyFormula,
      type: SurveyType.FORMS,
      isAnonymous: false,
      isAnswerChangeable: false,
    });

    if (response.data) {
      if (response.statusText === 'OK') {
        callback(saveNo, true);
      }
    }
    callback(saveNo, false);
  } catch (error) {
    callback(saveNo, false);
    console.error('ERROR saving and updating the survey in the db: ', error);
  }
}

export default saveSurveyJson;
