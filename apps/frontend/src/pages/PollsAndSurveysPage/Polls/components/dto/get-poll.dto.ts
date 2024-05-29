import eduApi from '@/api/eduApi.ts';
import {Poll} from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model.ts';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto.ts';

async function getPoll(pollName: string): Promise<Poll | undefined> {
  try {
    const response = await eduApi.get<Poll>(POLL_ENDPOINT, { data: { pollname: pollName } });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching a single survey: ${error}`);
  }
}

export default getPoll;
