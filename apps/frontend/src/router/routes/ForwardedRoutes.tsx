import React from 'react';
import { Route } from 'react-router-dom';
import BlankLayout from '@/components/layout/BlankLayout';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';

const getForwardedRoutes = (appConfigs: AppConfigDto[]) => [
  <Route
    key="forwarding"
    element={<BlankLayout />}
  >
    {appConfigs
      .filter((item) => item.appType === AppIntegrationType.FORWARDED)
      .map((item) => (
        <Route
          key={item.name}
          path={item.name}
          element={<ForwardingPage />}
        />
      ))}
  </Route>,
];

export default getForwardedRoutes;
