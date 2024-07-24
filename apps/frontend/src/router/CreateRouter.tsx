import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route } from 'react-router-dom';
import FramePlaceholder from '@/components/framing/FramePlaceholder';

import FileSharing from '@/pages/FileSharing/FileSharing';
import ConferencePage from '@/pages/ConferencePage/ConferencePage';
import getSettingsRoutes from './routes/SettingsRoutes';
import getForwardedRoutes from './routes/ForwardedRoutes';
import getEmbeddedRoutes from './routes/EmbeddedRoutes';
import { AppConfigDto, AppIntegrationType, APPS } from '@libs/appconfig/types';
import BlankLayout from '@/components/layout/BlankLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/Home';
import getClassManagementRoutes from '@/router/routes/ClassManagementRoutes';

const pageSwitch = (page: string) => {
  switch (page as APPS) {
    case APPS.CONFERENCES:
      return <ConferencePage />;
    case APPS.FILE_SHARING:
      return <FileSharing />;
    case APPS.MAIL:
      return <FramePlaceholder />;
    case APPS.LINUXMUSTER:
      return <FramePlaceholder />;
    case APPS.WHITEBOARD:
      return <FramePlaceholder />;
    case APPS.CLASS_MANAGEMENT:
      return <Outlet />;
    default:
      return (
        <Navigate
          replace
          to="/"
        />
      );
  }
};

const createRouter = (isAuthenticated: boolean, appConfigs: AppConfigDto[]) =>
  createBrowserRouter(
    createRoutesFromElements(
      !isAuthenticated ? (
        <Route element={<BlankLayout />}>
          <Route
            path="/"
            element={<LoginPage />}
          />
          <Route
            path="*"
            element={
              <Navigate
                replace
                to="/"
              />
            }
          />
        </Route>
      ) : (
        <>
          {getForwardedRoutes(appConfigs)}
          {getEmbeddedRoutes(appConfigs)}

          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<HomePage />}
            />
            {appConfigs
              .filter((item) => item.appType === AppIntegrationType.NATIVE)
              .map((item) => (
                <Route
                  key={item.name}
                  path={item.name}
                  element={pageSwitch(item.name)}
                />
              ))}
            {getClassManagementRoutes()}
            {getSettingsRoutes(appConfigs)}
          </Route>
        </>
      ),
    ),
  );

export default createRouter;
