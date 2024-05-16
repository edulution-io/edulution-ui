import eduApi from '@/api/eduApi';
import useUserStore from '@/store/userStore';
import { Survey } from '@/pages/Survey/backend-copy/model';
import UserSurveySearchTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import SURVEY_ENDPOINT from '@/pages/Survey/Forms/dto/survey-endpoint.dto';

async function getUserSurveys(param: UserSurveySearchTypes): Promise<Survey[] | undefined> {
  try {
    const { user } = useUserStore.getState();

    console.log('user: ', user);

    const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {
      params: { search: param, username: user },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getUserSurveys;
