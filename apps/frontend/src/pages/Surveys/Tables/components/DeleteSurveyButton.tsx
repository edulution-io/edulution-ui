import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useDeleteStore from '@/pages/Surveys/Tables/components/DeleteStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const DeleteSurveyButton = () => {
  const { selectedSurvey: survey, updateUsersSurveys } = useSurveyTablesPageStore();

  const { deleteSurvey, isLoading } = useDeleteStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

  return (
    <FloatingActionButton
      icon={MdOutlineDeleteOutline}
      text={t('common.delete')}
      onClick={async () => {
        await deleteSurvey([survey.id]);
        await updateUsersSurveys();
      }}
    />
  );
};

export default DeleteSurveyButton;