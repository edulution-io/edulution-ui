import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/Survey/backend-copy/model';
import UserSurveySearchTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import SURVEY_ENDPOINT from '@/pages/Survey/components/dto/survey-endpoint.dto';

async function getUserSurveys(param: UserSurveySearchTypes): Promise<Survey[] | undefined> {
  try {
    const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {
      params: { search: param },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getUserSurveys;
