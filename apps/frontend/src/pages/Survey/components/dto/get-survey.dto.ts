import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/Survey/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/Survey/components/dto/survey-endpoint.dto';

async function getSurvey(surveyName: string): Promise<Survey | undefined> {
  try {
    const response = await eduApi.get<Survey>(SURVEY_ENDPOINT, { data: { surveyname: surveyName } });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching a single survey: ${error}`);
  }
}

export default getSurvey;
