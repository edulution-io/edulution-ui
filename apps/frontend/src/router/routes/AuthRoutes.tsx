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
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import BlankLayout from '@/components/layout/BlankLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';
import ParticipatePublicSurvey from '@/pages/Surveys/Public/ParticipatePublicSurvey';

const getAuthRoutes = (isAuthenticated: boolean) => [
  <Route
    key="auth"
    element={<BlankLayout />}
  >
    <Route
      // TODO: NIEDUUI-392: Move 'public-surveys' route out of AuthRoutes and create a new PublicRoutes section.
      path={`${PUBLIC_SURVEYS_ENDPOINT}/*`}
      element={<ParticipatePublicSurvey />}
    />
    <Route
      path="/login"
      element={<LoginPage />}
    />
    <Route
      path="*"
      element={
        isAuthenticated ? (
          <Navigate
            replace
            to="/"
          />
        ) : (
          <Navigate
            replace
            to="/login"
            state={{ from: window.location.pathname }}
          />
        )
      }
    />
  </Route>,
];

export default getAuthRoutes;
