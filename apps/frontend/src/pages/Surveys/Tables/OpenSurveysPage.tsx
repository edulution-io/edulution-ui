/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
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
  } = useSurveyTablesPageStore();

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
