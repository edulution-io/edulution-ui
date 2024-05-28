import React, {useEffect, useState} from 'react';
import {Poll} from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto';
import {PollUpdateSelection} from '@/pages/PollsAndSurveysPage/Polls/PollPageStore';
import PollTable from '@/pages/PollsAndSurveysPage/Polls/components/PollTable';
import getUsersPolls from '@/pages/PollsAndSurveysPage/Polls/components/dto/get-users-polls.dto';

interface PollTableProps {
  pollType: UsersPollsTypes;
  title: string;
  // selectedPoll: Poll | undefined;
  updatePollSelection: (selection: PollUpdateSelection) => void;
  // openCreateDialog: () => void;
  // deletePoll: () => Promise<void>;
  shouldRefresh: boolean;
}

const PollSection = (props: PollTableProps) => {
  const {
    pollType,
    title,
    // selectedPoll,
    updatePollSelection,
    // openCreateDialog,
    // deletePoll,
    shouldRefresh,
  } = props;

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!shouldRefresh || isLoading) {
      return;
    }
    const fetchPolls = async () => {
      setIsLoading(true);
      try {
        const response = await getUsersPolls(pollType);
        if (response) {
          setPolls(response);
        }
      } catch (error) {
        console.error('Fetching surveys error: ', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPolls();
  }, [shouldRefresh]);

  return (
    <PollTable
      pollType={ pollType }
      polls={ polls }
      title={ title }
      isLoading={ isLoading }
      // selectedPoll={ selectedPoll }
      updatePollSelection={ updatePollSelection }
      // openCreateDialog={ openCreateDialog }
      // deletePoll={ deletePoll }
    />
  );
};

export default PollSection;
