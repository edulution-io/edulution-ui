import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiDelete } from 'react-icons/fi';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useDeleteStore from '@/pages/Surveys/Tables/components/DeleteStore';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const Delete = () => {
  const {
    selectedSurvey: survey,
    updateCreatedSurveys,
    updateOpenSurveys,
    updateAnsweredSurveys,
  } = useSurveyTablesPageStore();

  const {
    deleteSurvey,
    isLoading,
    // error,
  } = useDeleteStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

  return (
    <FloatingActionButton
      icon={FiDelete}
      text={t('common.delete')}
      onClick={async () => {
        // eslint-disable-next-line no-underscore-dangle
        await deleteSurvey(survey._id);
        await updateOpenSurveys();
        await updateCreatedSurveys();
        await updateAnsweredSurveys();
        // updateAllSurveys();
      }}
    />
  );
};

export default Delete;