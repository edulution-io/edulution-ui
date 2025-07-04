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
import { Navigate, Route } from 'react-router-dom';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/api/page-view';
import OpenSurveysPage from '@/pages/Surveys/Tables/OpenSurveysPage';
import AnsweredSurveysPage from '@/pages/Surveys/Tables/AnsweredSurveysPage';
import CreatedSurveysPage from '@/pages/Surveys/Tables/CreatedSurveysPage';
import SurveyEditorPage from '@/pages/Surveys/Editor/SurveyEditorPage';
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
      element={<SurveyEditorPage />}
    />
    <Route
      path={`${SurveysPageView.EDITOR}/:surveyId`}
      element={<SurveyEditorPage />}
    />
    <Route
      path={`${SurveysPageView.PARTICIPATION}/:surveyId`}
      element={<SurveyParticipationPage isPublic={false} />}
    />
  </Route>,
];

export default getSurveyRoutes;
