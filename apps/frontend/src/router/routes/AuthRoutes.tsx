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
    <Route>
      path={PUBLIC_SURVEYS_ENDPOINT}
      <Route
        path={`${PUBLIC_SURVEYS_ENDPOINT}/*`}
        element={<ParticipatePublicSurvey />}
      />
    </Route>
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
