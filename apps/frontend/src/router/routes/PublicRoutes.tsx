import React from 'react';
import { Route } from 'react-router-dom';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import ParticipatePublicSurvey from '@/pages/Surveys/Public/ParticipatePublicSurvey';
import BlankLayout from '@/components/layout/BlankLayout';

const getPublicRoutes = () => [
  <Route
    key="public"
    element={<BlankLayout />}
  >
    <Route
      // TODO: Replace the next line after the "Leistungsschau-2024 (23.09.2024)"
      path={`${PUBLIC_SURVEYS_ENDPOINT}/*`} // path={`${PUBLIC_SURVEYS_ENDPOINT}/:surveyId`}
      element={<ParticipatePublicSurvey />}
    />
  </Route>,
];

export default getPublicRoutes;
