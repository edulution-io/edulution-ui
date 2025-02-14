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

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const AnsweredSurveysPage = () => {
  const {
    selectSurvey,
    setSelectedRows,
    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,
    canParticipate,
    hasAnswers,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingAnsweredSurveys) {
      void updateAnsweredSurveys();
    }
  }, []);

  useEffect(() => {
    selectSurvey(undefined);
    setSelectedRows({});
    void fetch();
  }, []);

  return (
    <>
      {isFetchingAnsweredSurveys ? <LoadingIndicator isOpen={isFetchingAnsweredSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.answered.title')}
        description={t('surveys.view.answered.description')}
        surveys={answeredSurveys}
        isLoading={isFetchingAnsweredSurveys}
        canShowResults={hasAnswers}
        canParticipate={canParticipate}
        canShowSubmittedAnswers={hasAnswers}
      />
    </>
  );
};

export default AnsweredSurveysPage;
