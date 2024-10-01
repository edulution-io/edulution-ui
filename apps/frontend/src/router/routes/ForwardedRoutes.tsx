import React from 'react';
import { Route } from 'react-router-dom';
import BlankLayout from '@/components/layout/BlankLayout';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';

const getForwardedRoutes = (appConfigs: AppConfigDto[]) => [
  <Route
    key="forwarding"
    element={<BlankLayout />}
  >
    {appConfigs
      .filter((item) => item.appType === APP_INTEGRATION_VARIANT.forwarded)
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
