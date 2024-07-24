import React from 'react';
import { Route } from 'react-router-dom';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';

const getEmbeddedRoutes = (appConfigs: AppConfigDto[]) => [
  <Route key="embedded">
    {appConfigs
      .filter((item) => item.appType === AppIntegrationType.EMBEDDED)
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
