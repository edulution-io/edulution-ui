import React, { useEffect } from 'react';
// TODO: Replace the next line after the "Leistungsschau-2024 (23.09.2024)"
import { useSearchParams } from 'react-router-dom'; // import { useParams } from 'react-router-dom';
import useParticipatePublicSurveyStore from '@/pages/Surveys/Public/useParticipatePublicSurveyStore';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const ParticipatePublicSurvey = (): React.ReactNode => {
  // TODO: Replace the next two lines after the "Leistungsschau-2024 (23.09.2024)"
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('surveyId'); // const { surveyId } = useParams();

  const { survey, answer, setAnswer, pageNo, setPageNo, getPublicSurvey, answerPublicSurvey, isFetching } =
    useParticipatePublicSurveyStore();

  useEffect(() => {
    if (surveyId) {
      void getPublicSurvey(surveyId);
    }
  }, [surveyId]);

  return isFetching ? (
    <LoadingIndicator isOpen={isFetching} />
  ) : (
    <ParticipateDialog
      survey={survey}
      answer={answer}
      setAnswer={setAnswer}
      pageNo={pageNo}
      setPageNo={setPageNo}
      commitAnswer={answerPublicSurvey}
    />
  );
};

export default ParticipatePublicSurvey;
