import React from 'react';
import { t } from 'i18next';
import { AiOutlineDownSquare } from 'react-icons/ai';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

interface FloatingButtonOpenPollResultsProps {
  openPollResultsDialog: () => void;
}

const FloatingButtonOpenPollResults = (props: FloatingButtonOpenPollResultsProps) => {
  const { openPollResultsDialog } = props;

  return (
    <FloatingActionButton
      icon={AiOutlineDownSquare}
      text={t('survey.result')}
      onClick={openPollResultsDialog}
    />
  );
};

export default FloatingButtonOpenPollResults;
