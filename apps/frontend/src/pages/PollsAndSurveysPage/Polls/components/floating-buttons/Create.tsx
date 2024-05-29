import React from 'react';
import { t } from 'i18next';
import { AiOutlinePlusSquare } from 'react-icons/ai';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

interface FloatingButtonCreatePollProps {
  setSelectedPoll: (poll: Poll | undefined) => void;
  openEditPollDialog: () => void;
}

const FloatingButtonCreatePoll = (props: FloatingButtonCreatePollProps) => {
  const {setSelectedPoll, openEditPollDialog} = props;

  return (
    <FloatingActionButton
      icon={AiOutlinePlusSquare}
      text={t('poll.create')}
      onClick={() => {
        setSelectedPoll(undefined);
        openEditPollDialog();
      }}
    />
  );
}

export default FloatingButtonCreatePoll;
