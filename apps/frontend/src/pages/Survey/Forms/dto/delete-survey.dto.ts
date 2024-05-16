import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/Survey/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/Survey/Forms/dto/survey-endpoint.dto';

async function deleteSurvey(surveyName: string) {
  try {
    const response = await eduApi.delete<Survey[]>(SURVEY_ENDPOINT, {
      data: { surveyname: surveyName },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR deleting survey: ${error}`);
  }
}

export default deleteSurvey;
