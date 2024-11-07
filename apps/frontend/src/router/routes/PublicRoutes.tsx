import React from 'react';
import { Route } from 'react-router-dom';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';
import BlankLayout from '@/components/layout/BlankLayout';

const getPublicRoutes = () => [
  <Route
    key={PUBLIC_SURVEYS_ENDPOINT}
    element={<BlankLayout />}
  >
    <Route
      path={`${PUBLIC_SURVEYS_ENDPOINT}/:surveyId`}
      element={<SurveyParticipationPage isPublic />}
    />
  </Route>,
];

export default getPublicRoutes;
