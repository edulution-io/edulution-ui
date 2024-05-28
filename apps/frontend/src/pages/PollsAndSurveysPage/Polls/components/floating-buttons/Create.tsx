import React from 'react';
import { t } from 'i18next';
import { AiOutlinePlusSquare } from 'react-icons/ai';
import {Poll} from "@/pages/PollsAndSurveysPage/Polls/backend-copy/model.ts";
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

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
