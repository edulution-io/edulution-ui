import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto.ts';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';

async function getUsersSurveys(param: UsersSurveysTypes): Promise<Survey[] | undefined> {
  try {
    const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {
      params: { search: param },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getUsersSurveys;
