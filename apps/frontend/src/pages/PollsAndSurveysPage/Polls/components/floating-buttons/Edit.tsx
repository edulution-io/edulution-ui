import React from 'react';
import { t } from 'i18next';
import { FiEdit } from 'react-icons/fi';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

interface FloatingButtonEditPollProps {
  openEditPollDialog: () => void;
}

const FloatingButtonEditPoll = (props: FloatingButtonEditPollProps) => {
  const {openEditPollDialog} = props;

  return (
    <FloatingActionButton
      icon={FiEdit}
      text={t('survey.edit')}
      onClick={openEditPollDialog}
    />
  );
}

export default FloatingButtonEditPoll;
