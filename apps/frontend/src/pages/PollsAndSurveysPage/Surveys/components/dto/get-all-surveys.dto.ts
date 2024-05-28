import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';

async function getAllSurveys(): Promise<Survey[] | undefined> {
  try {
    const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching all surveys: ${error}`);
  }
}

export default getAllSurveys;
