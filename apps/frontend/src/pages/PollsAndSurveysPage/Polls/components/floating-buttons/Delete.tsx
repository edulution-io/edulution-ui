import React from 'react';
import { t } from 'i18next';
import { FiDelete } from 'react-icons/fi';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

interface FloatingButtonDeletePollProps {
  deletePoll: () => void;

  shouldRefreshOpen?: (refresh: boolean) => void;
  shouldRefreshParticipated?: (refresh: boolean) => void;
  shouldRefreshCreated?: (refresh: boolean) => void;
  shouldRefreshGlobalList?: (refresh: boolean) => void;
}

const FloatingButtonDeletePoll = (props: FloatingButtonDeletePollProps) => {
  const {
    deletePoll,

    shouldRefreshOpen,
    shouldRefreshParticipated,
    shouldRefreshCreated,
    shouldRefreshGlobalList,
  } = props;

  return (
    <FloatingActionButton
      icon={FiDelete}
      text={t('survey.delete')}
      onClick={ () => {
        deletePoll();
        shouldRefreshOpen ? shouldRefreshOpen(true) : null;
        shouldRefreshParticipated ? shouldRefreshParticipated(true) : null;
        shouldRefreshCreated ? shouldRefreshCreated(true) : null;
        shouldRefreshGlobalList ? shouldRefreshGlobalList(true) : null;
      } }
    />
  );
}

export default FloatingButtonDeletePoll;
