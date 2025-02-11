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

interface CreatedSurveysProps {
  edit: () => void;
}

const CreatedSurveys = (props: CreatedSurveysProps) => {
  const { edit } = props;
  const {
    selectedPageView,
    updateSelectedPageView,
    selectSurvey,
    setSelectedRows,
    createdSurveys,
    isFetchingCreatedSurveys,
    updateCreatedSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useSurveysPageHook(
    selectedPageView,
    SurveysPageView.CREATED,
    updateSelectedPageView,
    selectSurvey,
    setSelectedRows,
    updateCreatedSurveys,
    isFetchingCreatedSurveys,
    createdSurveys,
  );

  return (
    <>
      {isFetchingCreatedSurveys ? <LoadingIndicator isOpen={isFetchingCreatedSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.created.title')}
        description={t('surveys.view.created.description')}
        surveys={createdSurveys}
        isLoading={isFetchingCreatedSurveys}
        canDelete
        canEdit
        editSurvey={edit}
        canShowResults
        canParticipate
        canShowSubmittedAnswers
      />
    </>
  );
};

export default CreatedSurveys;
