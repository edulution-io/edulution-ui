import eduApi from '@/api/eduApi.ts';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model.ts';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto.ts';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto.ts';

async function getUsersPolls(param: UsersPollsTypes): Promise<Poll[] | undefined> {
  try {
    const response = await eduApi.get<Poll[]>(POLL_ENDPOINT, {
      params: { search: param },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getUsersPolls;
