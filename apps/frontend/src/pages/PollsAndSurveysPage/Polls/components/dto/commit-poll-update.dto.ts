import eduApi from '@/api/eduApi';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import POLL_ENDPOINT from '@/pages/PollsAndSurveysPage/Polls/components/dto/poll-endpoint.dto';

async function commitPollUpdate(
  pollName: string,
  pollFormula: string,
  pollParticipants: Attendee[],
  saveNo?: number,
  created?: Date,
) {
  try {
    const response = await eduApi.post<Poll>(POLL_ENDPOINT, {
      pollName: pollName,
      poll: pollFormula,
      participants: pollParticipants,
      saveNo,
      created,
      isAnonymous: false,
      isAnswerChangeable: false,
    });
    return response;
  } catch (error) {
    console.error('ERROR saving and updating the survey in the db: ', error);
    return error;
  }
}

export default commitPollUpdate;
