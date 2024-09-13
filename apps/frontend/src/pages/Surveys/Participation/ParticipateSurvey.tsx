import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const ParticipateSurvey = (): React.ReactNode => {
  const { surveyId } = useParams();

  const { selectedSurvey, updateSelectedSurvey, isFetching } = useSurveyTablesPageStore();
  const { answer, setAnswer, pageNo, setPageNo, answerSurvey } = useParticipateDialogStore();

  useEffect(() => {
    if (surveyId) {
      void updateSelectedSurvey(surveyId);
    }
  }, [surveyId]);

  return isFetching ? (
    <LoadingIndicator isOpen={isFetching} />
  ) : (
    <ParticipateDialog
      survey={selectedSurvey}
      answer={answer}
      setAnswer={setAnswer}
      pageNo={pageNo}
      setPageNo={setPageNo}
      commitAnswer={answerSurvey}
    />
  );
};

export default ParticipateSurvey;
