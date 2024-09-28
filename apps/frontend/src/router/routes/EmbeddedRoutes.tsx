import React from 'react';
import { Route } from 'react-router-dom';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import { AppConfigDto } from '@libs/appconfig/types';
import AppIntegrationVariant from '@libs/appconfig/constants/appIntegrationVariants';

const getEmbeddedRoutes = (appConfigs: AppConfigDto[]) => [
  <Route key="embedded">
    {appConfigs
      .filter((item) => item.appType === AppIntegrationVariant.embedded)
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
