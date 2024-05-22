import eduApi from '@/api/eduApi';
import { SurveyAnswer } from '@/pages/Survey/backend-copy/model';
import UserSurveyTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import SURVEY_ENDPOINT from '@/pages/Survey/components/dto/survey-endpoint.dto';

interface getUserAnswerProps {
  surveyName: string;
}

async function getUserAnswer(props: getUserAnswerProps): Promise<SurveyAnswer | undefined> {
  try {
    const { surveyName } = props;
    const response = await eduApi.get<SurveyAnswer>(SURVEY_ENDPOINT, {
      params: { search: UserSurveyTypes.ANSWER, surveyname: surveyName },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getUserAnswer;
