import React from 'react';
import { t } from 'i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

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
