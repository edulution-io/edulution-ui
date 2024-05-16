import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/Survey/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/Survey/Forms/dto/survey-endpoint.dto';

async function getSurveys(): Promise<Survey[] | undefined> {
  try {
    const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching all surveys: ${error}`);
  }
}

export default getSurveys;
