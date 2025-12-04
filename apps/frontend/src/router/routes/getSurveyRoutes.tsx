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
import { Navigate, Route } from 'react-router-dom';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/api/surveysPageView';
import OpenSurveysPage from '@/pages/Surveys/Tables/OpenSurveysPage';
import AnsweredSurveysPage from '@/pages/Surveys/Tables/AnsweredSurveysPage';
import CreatedSurveysPage from '@/pages/Surveys/Tables/CreatedSurveysPage';
import SurveyEditorOpeningPage from '@/pages/Surveys/Editor/SurveyEditorOpeningPage';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';

const getSurveyRoutes = () => [
  <Route
    key={SURVEYS}
    path={SURVEYS}
  >
    <Route
      path=""
      element={
        <Navigate
          to={SurveysPageView.OPEN}
          replace
        />
      }
    />
    <Route
      path={SurveysPageView.OPEN}
      element={<OpenSurveysPage />}
    />
    <Route
      path={SurveysPageView.ANSWERED}
      element={<AnsweredSurveysPage />}
    />
    <Route
      path={SurveysPageView.CREATED}
      element={<CreatedSurveysPage />}
    />
    <Route
      path={SurveysPageView.CREATOR}
      element={<SurveyEditorOpeningPage />}
    />
    <Route
      path={`${SurveysPageView.EDITOR}/:surveyId`}
      element={<SurveyEditorOpeningPage />}
    />
    <Route
      path={`${SurveysPageView.PARTICIPATION}/:surveyId`}
      element={<SurveyParticipationPage isPublic={false} />}
    />
  </Route>,
];

export default getSurveyRoutes;
