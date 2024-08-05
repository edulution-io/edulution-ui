import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/participate-survey/ParticipateDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/participate-survey/useParticpateDialogStore';

const ParticipateDialog = () => {
  const { selectedSurvey: survey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const {
    isOpenParticipateSurveyDialog,
    setIsOpenParticipateSurveyDialog,
    answer,
    setAnswer,
    answerSurvey,
    isLoading,
  } = useParticipateDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (!survey) return null;
    return (
      <ParticipateDialogBody
        surveyId={survey.id}
        saveNo={survey.saveNo}
        formula={survey.formula}
        answer={answer}
        setAnswer={setAnswer}
        commitAnswer={answerSurvey}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
        setIsOpenParticipateSurveyDialog={setIsOpenParticipateSurveyDialog}
      />
    );
  };

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      {isOpenParticipateSurveyDialog ? (
        <AdaptiveDialog
          isOpen={isOpenParticipateSurveyDialog}
          handleOpenChange={() => setIsOpenParticipateSurveyDialog(!isOpenParticipateSurveyDialog)}
          title={t('surveys.participateDialog.title')}
          body={getDialogBody()}
          desktopContentClassName="max-w-[75%]"
        />
      ) : null}
    </>
  );
};

export default ParticipateDialog;
