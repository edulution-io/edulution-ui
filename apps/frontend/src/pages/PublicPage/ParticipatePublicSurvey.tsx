import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import useParticipatePublicSurveyStore from '@/pages/PublicPage/useParticipatePublicSurveyStore';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';

const ParticipatePublicSurvey = (): React.ReactNode => {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('surveyId');

  const { survey, answer, setAnswer, pageNo, setPageNo, getPublicSurvey, answerPublicSurvey } =
    useParticipatePublicSurveyStore();

  useEffect(() => {
    if (surveyId) {
      void getPublicSurvey(surveyId);
    }
  }, [surveyId]);

  const getContent = () => {
    if (!surveyId) {
      return <p className="transform(-50%,-50%) absolute right-1/2 top-1/2"> Survey Id not found </p>;
    }
    if (!survey) {
      return <p className="transform(-50%,-50%) absolute right-1/2 top-1/2"> Survey not found </p>;
    }
    return (
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
      />
    );
  };

  return (
    <>
      {getContent()}
      <QRCodeDisplay
        className="translateX(50%) absolute bottom-0 right-1/2 pb-5"
        // style={{display: 'absolute', right: '50%', transform: 'translate(-50%, 0)', bottom: '0', paddingBottom: '5px'}}
        value={window.location.href}
      />
    </>
  );
};

export default ParticipatePublicSurvey;
