import eduApi from '@/api/eduApi.ts';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto';

async function getUsersPolls(param: UsersPollsTypes): Promise<Poll[] | undefined> {
  try {
    const response = await eduApi.get<Poll[]>(POLL_ENDPOINT, {
      params: { search: param },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users polls: ${error}`);
  }
}

export default getUsersPolls;
