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
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { SurveysViewOpenIcon } from '@/assets/icons';

const OpenSurveysPage = () => {
  const {
    selectSurvey,
    setSelectedRows,
    openSurveys,
    updateOpenSurveys,
    isFetchingOpenSurveys,
    hasAnswers,
    canParticipate,
  } = useSurveysTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingOpenSurveys) {
      void updateOpenSurveys();
    }
  }, []);

  useEffect(() => {
    setSelectedRows({});
    selectSurvey(undefined);
    void fetch();
  }, []);

  return (
    <>
      {isFetchingOpenSurveys ? <LoadingIndicatorDialog isOpen={isFetchingOpenSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.open.title')}
        description={t('surveys.view.open.description')}
        icon={SurveysViewOpenIcon}
        surveys={openSurveys || []}
        isLoading={isFetchingOpenSurveys}
        canShowResults={hasAnswers}
        canParticipate={canParticipate}
      />
    </>
  );
};

export default OpenSurveysPage;
