import React from 'react';
import { t } from 'i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

interface FloatingButtonParticipatePollProps {
  openParticipatePollDialog: () => void;
}

const FloatingButtonParticipatePoll = (props: FloatingButtonParticipatePollProps) => {
  const {openParticipatePollDialog} = props;

  return (
    <FloatingActionButton
      icon={AiOutlineUpSquare}
      text={t('poll.participate')}
      onClick={openParticipatePollDialog}
    />
  );
}

export default FloatingButtonParticipatePoll;
