import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticpateDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ParticipateSurvey from '@/pages/Surveys/Participation/components/ParticipateSurvey';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;
  const { selectedSurvey, updateSelectedSurvey, isFetching } = useSurveyTablesPageStore();
  const { answer, setAnswer, pageNo, setPageNo, answerSurvey, hasFinished, setHasFinished } =
    useParticipateSurveyStore();

  const { t } = useTranslation();

  const { surveyId } = useParams();

  useEffect(() => {
    setHasFinished(false);
    void updateSelectedSurvey(surveyId, isPublic);
  }, [surveyId]);

  const content = useMemo(() => {
    if (hasFinished) {
      return (
        <div className="relative top-1/3">
          <h4 className="flex justify-center">{t('survey.finished')}</h4>
          <h4 className="flex justify-center">{t('survey.thanks')}</h4>
        </div>
      );
    }
    if (!selectedSurvey) {
      return (
        <div className="relative top-1/3">
          <h4 className="flex justify-center">{t('survey.notFound')}</h4>
        </div>
      );
    }
    return (
      <ScrollArea>
        <ParticipateSurvey
          surveyId={selectedSurvey.id}
          saveNo={selectedSurvey.saveNo}
          formula={selectedSurvey.formula}
          answer={answer}
          setAnswer={setAnswer}
          pageNo={pageNo}
          setPageNo={setPageNo}
          commitAnswer={answerSurvey}
          className="survey-participation"
          isPublic={isPublic}
        />
      </ScrollArea>
    );
  }, [selectedSurvey, answer, pageNo, hasFinished]);

  return isFetching ? <LoadingIndicator isOpen={isFetching} /> : content;
};

export default SurveyParticipationPage;
