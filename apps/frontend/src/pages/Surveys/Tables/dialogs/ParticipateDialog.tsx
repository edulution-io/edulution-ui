import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';

const ParticipateDialog = () => {
  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const {
    isOpenParticipateSurveyDialog,
    setIsOpenParticipateSurveyDialog,
    answer,
    setAnswer,
    pageNo,
    setPageNo,
    answerSurvey,
    isLoading,
  } = useParticipateDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (!selectedSurvey) return null;
    return (
      <ParticipateDialogBody
        surveyId={selectedSurvey.id}
        saveNo={selectedSurvey.saveNo}
        formula={selectedSurvey.formula}
        answer={answer}
        setAnswer={setAnswer}
        pageNo={pageNo}
        setPageNo={setPageNo}
        commitAnswer={answerSurvey}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
        setIsOpenParticipateSurveyDialog={setIsOpenParticipateSurveyDialog}
        className="max-h-[75vh] overflow-y-auto rounded bg-gray-600 p-4"
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
