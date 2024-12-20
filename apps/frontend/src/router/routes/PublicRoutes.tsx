import React from 'react';
import { Route } from 'react-router-dom';
import { PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';
import BlankLayout from '@/components/layout/BlankLayout';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import PublicConferencePage from '@/pages/ConferencePage/PublicConference/PublicConferencePage';

const getPublicRoutes = () => [
  <Route
    key={CONFERENCES_PUBLIC_EDU_API_ENDPOINT}
    element={<BlankLayout />}
  >
    <Route
      path={`${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/:meetingId`}
      element={<PublicConferencePage />}
    />
  </Route>,
  <Route
    key={PUBLIC_SURVEYS}
    element={<BlankLayout />}
  >
    <Route
      path={`${PUBLIC_SURVEYS}/:surveyId`}
      element={<SurveyParticipationPage isPublic />}
    />
  </Route>,
];

export default getPublicRoutes;
