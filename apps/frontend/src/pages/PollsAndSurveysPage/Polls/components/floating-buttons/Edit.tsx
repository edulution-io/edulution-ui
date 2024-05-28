import React from 'react';
import { t } from 'i18next';
import { FiEdit } from 'react-icons/fi';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

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
