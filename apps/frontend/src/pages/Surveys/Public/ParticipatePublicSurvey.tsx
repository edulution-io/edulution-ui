import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import useParticipatePublicSurveyStore from '@/pages/Surveys/Public/useParticipatePublicSurveyStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { ScrollArea } from '@/components/ui/ScrollArea';

const ParticipatePublicSurvey = (): React.ReactNode => {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('surveyId');

  const { getPublicSurvey, publicSurvey, answer, setAnswer, pageNo, setPageNo, answerPublicSurvey, isFetching, reset } =
    useParticipatePublicSurveyStore();

  useEffect(() => {
    window.onbeforeunload = function Unload() {
      reset();
    };
    window.onreset = function Reload() {
      reset();
      if (surveyId) {
        void getPublicSurvey(surveyId);
      }
    };
  }, []);

  const { t } = useTranslation();

  useEffect(() => {
    if (surveyId) {
      void getPublicSurvey(surveyId);
    }
  }, [surveyId]);

  const handleSubmission = async (submission: JSON) => {
    if (publicSurvey) {
      try {
        await answerPublicSurvey(publicSurvey.id, publicSurvey.saveNo, submission);
      } catch (error) {
        console.error(error);
        return;
      }

      setTimeout(() => {
        reset();
        if (surveyId) {
          void getPublicSurvey(surveyId);
        }
      }, 4500);
    }
  };

  const content = useMemo(() => {
    if (!surveyId || !publicSurvey) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <ParticipateDialogBody
          formula={publicSurvey.formula}
          answer={answer}
          setAnswer={setAnswer}
          pageNo={pageNo}
          setPageNo={setPageNo}
          submitAnswer={handleSubmission}
          className="survey-participation"
        />
      </ScrollArea>
    );
  }, [surveyId, publicSurvey, answer, pageNo]);

  return (
    <>
      {isFetching ? <LoadingIndicator isOpen={isFetching} /> : null}
      {content}
    </>
  );
};

export default ParticipatePublicSurvey;
