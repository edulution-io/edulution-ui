/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ParticipateSurvey from '@/pages/Surveys/Participation/components/ParticipateSurvey';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;
  const { selectedSurvey, updateSelectedSurvey, isFetching } = useSurveyTablesPageStore();
  const { answer, setAnswer, pageNo, setPageNo, answerSurvey, hasFinished, reset } = useParticipateSurveyStore();

  const { t } = useTranslation();

  const { surveyId } = useParams();

  useEffect(() => {
    reset();
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
      <ParticipateSurvey
        surveyId={selectedSurvey.id!}
        saveNo={selectedSurvey.saveNo}
        formula={selectedSurvey.formula}
        answer={answer}
        setAnswer={setAnswer}
        pageNo={pageNo}
        setPageNo={setPageNo}
        submitAnswer={answerSurvey}
        isPublic={isPublic}
      />
    );
  }, [selectedSurvey, answer, pageNo, hasFinished]);

  return isFetching ? <LoadingIndicatorDialog isOpen={isFetching} /> : content;
};

export default SurveyParticipationPage;
