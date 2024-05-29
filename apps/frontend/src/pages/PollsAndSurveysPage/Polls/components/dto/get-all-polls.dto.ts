import eduApi from '@/api/eduApi.ts';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model.ts';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto.ts';

async function getAllPolls(): Promise<Poll[] | undefined> {
  try {
    const response = await eduApi.get<Poll[]>(POLL_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching all polls: ${error}`);
  }
}

export default getAllPolls;
