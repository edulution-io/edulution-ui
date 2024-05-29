import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';

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
