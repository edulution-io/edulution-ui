import eduApi from '@/api/eduApi';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';
import Attendee from '@/pages/ConferencePage/dto/attendee';

interface getSurveyAnswersProps {
  surveyName: string;
  participants?: Attendee[];
}

async function getSurveyAnswers(props: getSurveyAnswersProps): Promise<JSON[] | undefined> {
  try {
    const { surveyName, participants } = props;
    const response = await eduApi.get<JSON[]>(SURVEY_ENDPOINT, {
      params: { search: UsersSurveysTypes.ANSWER, surveyname: surveyName },
      data: { participants: participants },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getSurveyAnswers;
