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
  const { answer, setAnswer, pageNo, setPageNo, answerSurvey } = useParticipateSurveyStore();

  const { t } = useTranslation();

  const { surveyId } = useParams();

  useEffect(() => {
    void updateSelectedSurvey(surveyId, isPublic);
  }, [surveyId]);

  const content = useMemo(
    () => (
      <ScrollArea>
        {!selectedSurvey ? (
          <div className="h-[50%] w-[50%]">
            <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>
          </div>
        ) : (
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
        )}
      </ScrollArea>
    ),
    [selectedSurvey, answer, pageNo],
  );

  return isFetching ? <LoadingIndicator isOpen={isFetching} /> : content;
};

export default SurveyParticipationPage;
