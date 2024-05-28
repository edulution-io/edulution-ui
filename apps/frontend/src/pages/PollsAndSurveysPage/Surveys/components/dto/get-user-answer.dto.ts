import eduApi from '@/api/eduApi';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto.ts';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';

interface getUserAnswerProps {
  surveyName: string;
}

async function getUserAnswer(props: getUserAnswerProps): Promise<string | undefined> {
  try {
    const { surveyName } = props;
    const response = await eduApi.get<string>(SURVEY_ENDPOINT, {
      params: { search: UsersSurveysTypes.ANSWER, surveyname: surveyName },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getUserAnswer;
