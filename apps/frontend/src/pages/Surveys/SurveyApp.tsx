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

import React from 'react';
import SurveysPageView from '@libs/survey/types/api/surveysPageView';
import OpenSurveysPage from '@/pages/Surveys/Tables/OpenSurveysPage';
import AnsweredSurveysPage from '@/pages/Surveys/Tables/AnsweredSurveysPage';
import CreatedSurveysPage from '@/pages/Surveys/Tables/CreatedSurveysPage';
import SurveyEditorEntryPage from '@/pages/Surveys/Editor/SurveyEditorEntryPage';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';

import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface SurveyAppProps {
  surveysPageView: SurveysPageView;
  isPublic?: boolean;
}

const SurveyApp = (props: SurveyAppProps) => {
  const { surveysPageView, isPublic = false } = props;

  const getContent = () => {
    switch (surveysPageView) {
      case SurveysPageView.OPEN:
        return <OpenSurveysPage />;
      case SurveysPageView.ANSWERED:
        return <AnsweredSurveysPage />;
      case SurveysPageView.CREATED:
        return <CreatedSurveysPage />;
      case SurveysPageView.CREATOR:
        return <SurveyEditorEntryPage />;
      case SurveysPageView.EDITOR:
        return <SurveyEditorEntryPage />;
      case SurveysPageView.PARTICIPATION:
        return <SurveyParticipationPage isPublic={isPublic} />;
      default:
        return null;
    }
  };

  return (
    // <Suspense fallback={<CircleLoader />}>
    getContent()
    // </Suspense>
  );
};

export default SurveyApp;
