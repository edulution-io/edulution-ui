import React, { useMemo } from 'react';
import ParticipationBody from '@/pages/Surveys/Tables/components/ParticipationBody';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { ScrollArea } from '@/components/ui/ScrollArea';

const Participation = (): React.ReactNode => {
  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys, isFetching } = useSurveyTablesPageStore();
  const { answer, setAnswer, pageNo, setPageNo, answerSurvey, isLoading } = useParticipateDialogStore();

  const content = useMemo(() => {
    if (!selectedSurvey) {
      return <p className="transform(-50%,-50%) absolute right-1/2 top-1/2"> Survey not found </p>;
    }
    return (
      <ScrollArea className="w-fill h-fill overflow-y-auto">
        <ParticipationBody
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
        />
      </ScrollArea>
    );
  }, [selectedSurvey]);

  return (
    <>
      {isLoading || isFetching ? <LoadingIndicator isOpen={isLoading || isFetching} /> : null}
      {content}
    </>
  );
};

export default Participation;
