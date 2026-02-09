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

import React, { lazy, Suspense } from 'react';
import SurveysPageView from '@libs/survey/types/api/surveysPageView';
import OpenSurveysPage from '@/pages/Surveys/Tables/OpenSurveysPage';
import AnsweredSurveysPage from '@/pages/Surveys/Tables/AnsweredSurveysPage';
import CreatedSurveysPage from '@/pages/Surveys/Tables/CreatedSurveysPage';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

const SurveyEditorEntryPage = lazy(() => import('./Editor/SurveyEditorEntryPage'));
const SurveyParticipationPage = lazy(() => import('./Participation/SurveyParticipationPage'));

interface SurveyAppProps {
  surveysPageView?: SurveysPageView;
  isPublicParticipation?: boolean;
}

const SurveyApp = (props: SurveyAppProps) => {
  const { surveysPageView, isPublicParticipation = false } = props;

  if (isPublicParticipation) {
    return (
      <Suspense fallback={<CircleLoader />}>
        <SurveyParticipationPage isPublic />
      </Suspense>
    );
  }

  switch (surveysPageView) {
    case SurveysPageView.OPEN:
      return <OpenSurveysPage />;
    case SurveysPageView.PARTICIPATION:
      return (
        <Suspense fallback={<CircleLoader />}>
          <SurveyParticipationPage isPublic={false} />
        </Suspense>
      );
    case SurveysPageView.ANSWERED:
      return <AnsweredSurveysPage />;
    case SurveysPageView.CREATED:
      return <CreatedSurveysPage />;
    case SurveysPageView.CREATOR:
    case SurveysPageView.EDITOR:
      return (
        <Suspense fallback={<CircleLoader />}>
          <SurveyEditorEntryPage />
        </Suspense>
      );
    default:
      return <OpenSurveysPage />;
  }
};

export default SurveyApp;
