import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/ParticipateDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import FloatingActionButton from '@/components/shared/FloatingActionButton';

const Participate = () => {
  const { selectedSurvey: survey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const {
    isOpenParticipateSurveyDialog,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
    commitAnswer,
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
        commitAnswer={commitAnswer}
        isCommiting={isLoading}
        errorCommiting={error}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
      />
    </>
  );
};

export default Participate;
