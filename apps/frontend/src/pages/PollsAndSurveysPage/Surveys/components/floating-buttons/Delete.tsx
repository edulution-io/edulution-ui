import React from 'react';
import { t } from 'i18next';
import { FiDelete } from 'react-icons/fi';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

interface FloatingButtonDeleteSurveyProps {
  deleteSurvey: () => void;

  shouldRefreshOpen?: (refresh: boolean) => void;
  shouldRefreshParticipated?: (refresh: boolean) => void;
  shouldRefreshCreated?: (refresh: boolean) => void;
  shouldRefreshGlobalList?: (refresh: boolean) => void;
}

const FloatingButtonDeleteSurvey = (props: FloatingButtonDeleteSurveyProps) => {
  const {
    deleteSurvey,

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
        deleteSurvey();
        shouldRefreshOpen ? shouldRefreshOpen(true) : null;
        shouldRefreshParticipated ? shouldRefreshParticipated(true) : null;
        shouldRefreshCreated ? shouldRefreshCreated(true) : null;
        shouldRefreshGlobalList ? shouldRefreshGlobalList(true) : null;
      } }
    />
  );
}

export default FloatingButtonDeleteSurvey;
