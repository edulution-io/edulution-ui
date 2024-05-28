import { CompleteEvent } from 'survey-core';
import eduApi from '@/api/eduApi';
import { PollChoices } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto';

async function pushChoice(
  pollName: string,
  choice: string,
  userText?: string,
  options?: CompleteEvent,
): Promise<PollChoices | undefined> {
  try {
    // Display the "Saving..." message (pass a string value to display a custom message)
    options?.showSaveInProgress();
    const response = await eduApi.patch<PollChoices>(POLL_ENDPOINT, {
      pollName,
      choice,
      userText,
    });
    // Display the "Success" message (pass a string value to display a custom message)
    options?.showSaveSuccess();
    return response.data;
  } catch (error) {
    // Display the "Error" message (pass a string value to display a custom message)
    options?.showSaveError();
    throw new Error(`ERROR saving answer: ${error}`);
  }
}

export default pushChoice;
