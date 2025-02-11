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

import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/api/page-view';
import useSurveysPageHook from '@/pages/Surveys/Tables/hooks/use-surveys-page-hook';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const OpenSurveys = () => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectSurvey,
    setSelectedRows,
    openSurveys,
    updateOpenSurveys,
    isFetchingOpenSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useSurveysPageHook(
    selectedPageView,
    SurveysPageView.OPEN,
    updateSelectedPageView,
    selectSurvey,
    setSelectedRows,
    updateOpenSurveys,
    isFetchingOpenSurveys,
    openSurveys,
  );

  return (
    <>
      {isFetchingOpenSurveys ? <LoadingIndicator isOpen={isFetchingOpenSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.open.title')}
        description={t('surveys.view.open.description')}
        surveys={openSurveys || []}
        isLoading={isFetchingOpenSurveys}
        canShowResults
        canParticipate
      />
    </>
  );
};

export default OpenSurveys;
