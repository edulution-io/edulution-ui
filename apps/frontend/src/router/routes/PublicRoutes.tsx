import React from 'react';
import { Route } from 'react-router-dom';
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
];

export default getPublicRoutes;
