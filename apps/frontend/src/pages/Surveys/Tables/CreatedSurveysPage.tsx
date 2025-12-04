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
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { UserIcon } from '@/assets/icons';

const CreatedSurveysPage = () => {
  const {
    selectSurvey,
    setSelectedRows,
    createdSurveys,
    isFetchingCreatedSurveys,
    updateCreatedSurveys,
    hasAnswers,
    canParticipate,
  } = useSurveysTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingCreatedSurveys) {
      void updateCreatedSurveys();
    }
  }, []);

  useEffect(() => {
    setSelectedRows({});
    selectSurvey(undefined);
    void fetch();
  }, []);

  return (
    <>
      {isFetchingCreatedSurveys ? <LoadingIndicatorDialog isOpen={isFetchingCreatedSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.created.title')}
        description={t('surveys.view.created.description')}
        icon={UserIcon}
        surveys={createdSurveys}
        isLoading={isFetchingCreatedSurveys}
        canDelete
        canEdit
        canShowResults={hasAnswers}
        canParticipate={canParticipate}
        canShowSubmittedAnswers={hasAnswers}
      />
    </>
  );
};

export default CreatedSurveysPage;
