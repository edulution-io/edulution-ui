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

  const { survey, answer, setAnswer, pageNo, setPageNo, getPublicSurvey, answerPublicSurvey, isFetching } =
    useParticipatePublicSurveyStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (surveyId) {
      void getPublicSurvey(surveyId);
    }
  }, [surveyId]);

  const content = useMemo(() => {
    if (!surveyId || !survey) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <ParticipateDialogBody
          surveyId={survey.id}
          saveNo={survey.saveNo}
          formula={survey.formula}
          answer={answer}
          setAnswer={setAnswer}
          pageNo={pageNo}
          setPageNo={setPageNo}
          commitAnswer={answerPublicSurvey}
          updateOpenSurveys={() => {}}
          updateAnsweredSurveys={() => {}}
          setIsOpenParticipateSurveyDialog={() => {}}
          className="survey-participation"
        />
      </ScrollArea>
    );
  }, [surveyId, survey, answer, pageNo]);

  return (
    <>
      {isFetching ? <LoadingIndicator isOpen={isFetching} /> : null}
      {content}
    </>
  );
};

export default ParticipatePublicSurvey;
