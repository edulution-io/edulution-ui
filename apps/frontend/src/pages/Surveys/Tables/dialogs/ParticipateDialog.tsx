import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticipateDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';

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

  const content = useMemo(() => {
    if (!selectedSurvey) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <ParticipateDialogBody
          surveyId={selectedSurvey.id}
          saveNo={selectedSurvey.saveNo}
          formula={selectedSurvey.formula}
          answer={answer}
          setAnswer={setAnswer}
          pageNo={pageNo}
          setPageNo={setPageNo}
          submitAnswer={answerSurvey}
          updateOpenSurveys={updateOpenSurveys}
          updateAnsweredSurveys={updateAnsweredSurveys}
          setIsOpenParticipateSurveyDialog={setIsOpenParticipateSurveyDialog}
          className="max-h-[75vh] overflow-y-auto rounded bg-gray-600 p-4"
        />
      </ScrollArea>
    );
  }, [selectedSurvey, answer, pageNo]);

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      {isOpenParticipateSurveyDialog ? (
        <AdaptiveDialog
          isOpen={isOpenParticipateSurveyDialog}
          handleOpenChange={() => setIsOpenParticipateSurveyDialog(!isOpenParticipateSurveyDialog)}
          title={t('surveys.participateDialog.title')}
          body={content}
          desktopContentClassName="max-w-[75%]"
        />
      ) : null}
    </>
  );
};

export default ParticipateDialog;
