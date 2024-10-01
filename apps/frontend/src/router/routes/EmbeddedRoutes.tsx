import React from 'react';
import { Route } from 'react-router-dom';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';

const getEmbeddedRoutes = (appConfigs: AppConfigDto[]) => [
  <Route key="embedded">
    {appConfigs
      .filter((item) => item.appType === APP_INTEGRATION_VARIANT.embedded)
      .map((item) => (
        <Route
          key={item.name}
          path={item.name}
          element={<FramePlaceholder />}
        />
      ))}
  </Route>,
];

export default getEmbeddedRoutes;
