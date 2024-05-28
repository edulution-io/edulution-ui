import eduApi from '@/api/eduApi';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto';

interface getResultProps {
  pollName: string;
}

async function getResult(props: getResultProps): Promise<string | undefined> {
  try {
    const { pollName } = props;
    const response = await eduApi.get<string>(POLL_ENDPOINT, {
      params: { search: UsersPollsTypes.ANSWER, pollName: pollName },
    });
    return response.data;
  } catch (error) {
    throw new Error(`ERROR fetching users surveys: ${error}`);
  }
}

export default getResult;
