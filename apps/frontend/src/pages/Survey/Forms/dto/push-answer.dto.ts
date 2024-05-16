import { CompleteEvent } from 'survey-core';
import eduApi from '@/api/eduApi';
import { Survey } from '@/pages/Survey/backend-copy/model';
import SURVEY_ENDPOINT from '@/pages/Survey/Forms/dto/survey-endpoint.dto';

async function pushAnswer(surveyName: string, answer: JSON, options: CompleteEvent): Promise<Survey[] | undefined> {
  try {
    // Display the "Saving..." message (pass a string value to display a custom message)
    options.showSaveInProgress();
    const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {
      data: { surveyname: surveyName, answer },
    });
    // Display the "Success" message (pass a string value to display a custom message)
    options.showSaveSuccess();
    return response.data;
  } catch (error) {
    // Display the "Error" message (pass a string value to display a custom message)
    options.showSaveError();
    throw new Error(`ERROR saving answer: ${error}`);
  }
}

export default pushAnswer;
