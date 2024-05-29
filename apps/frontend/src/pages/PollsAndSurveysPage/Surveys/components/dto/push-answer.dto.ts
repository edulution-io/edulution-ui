import { CompleteEvent } from 'survey-core';
import eduApi from '@/api/eduApi';
import { SurveyAnswer } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/PollsAndSurveysPage/Surveys/components/dto/survey-endpoint.dto';

async function pushAnswer(
  surveyName: string,
  answer: string,
  options?: CompleteEvent,
): Promise<SurveyAnswer | undefined> {
  console.log('pushAnswer::surveyName', surveyName, 'answer', answer, 'options', options);

  try {
    // Display the "Saving..." message (pass a string value to display a custom message)
    options?.showSaveInProgress();
    const response = await eduApi.patch<SurveyAnswer>(SURVEY_ENDPOINT, {
      surveyname: surveyName,
      answer,
    });

    console.log('pushAnswer::response', response.data);

    // Display the "Success" message (pass a string value to display a custom message)
    options?.showSaveSuccess();
    return response.data;
  } catch (error) {
    // Display the "Error" message (pass a string value to display a custom message)
    options?.showSaveError();
    throw new Error(`ERROR saving answer: ${error}`);
  }
}

export default pushAnswer;
