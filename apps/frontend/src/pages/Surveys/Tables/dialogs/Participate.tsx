import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/ParticipateDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

const Participate = () => {
  const { selectedSurvey: survey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const {
    isOpenParticipateSurveyDialog,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
    answerSurvey,
    isLoading,
    error,
  } = useParticipateDialogStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        icon={AiOutlineUpSquare}
        text={t('common.participate')}
        onClick={openParticipateSurveyDialog}
      />
      <ParticipateDialog
        survey={survey}
        isOpenParticipateSurveyDialog={isOpenParticipateSurveyDialog}
        openParticipateSurveyDialog={openParticipateSurveyDialog}
        closeParticipateSurveyDialog={closeParticipateSurveyDialog}
        commitAnswer={answerSurvey}
        isLoading={isLoading}
        error={error}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
      />
    </>
  );
};

export default Participate;