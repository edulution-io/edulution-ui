import eduApi from '@/api/eduApi';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model.ts';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto.ts';

async function deletePoll(pollName: string) {
  try {
    const response = await eduApi.delete<Poll[]>(POLL_ENDPOINT, {
      data: { pollName: pollName },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR deleting poll: ${error}`);
  }
}

export default deletePoll;
