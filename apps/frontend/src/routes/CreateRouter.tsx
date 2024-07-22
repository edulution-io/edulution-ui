import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, Outlet } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import HomePage from '@/pages/Home/HomePage';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';

import FileSharing from '@/pages/FileSharing/FileSharing';
import ConferencePage from '@/pages/ConferencePage/ConferencePage';
import LoginPage from '@/pages/LoginPage/LoginPage';

import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import { AppConfigDto, AppIntegrationType, APPS } from '@libs/appconfig/types';
import { SECURITY_PATH, USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import UserSettingsDefaultPage from '@/pages/UserSettings/UserSettingsDefaultPage';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';

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
    case APPS.DESKTOP_DEPLOYMENT:
      return <DesktopDeploymentPage />;
    default:
      return (
        <Navigate
          replace
          to="/"
        />
      );
  }
};

const createRouter = (isAuthenticated: boolean, appConfig: AppConfigDto[]) =>
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
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path={USER_SETTINGS_PATH}
              element={<Outlet />}
            >
              <Route
                path=""
                element={<UserSettingsDefaultPage />}
              />
              <Route
                path={SECURITY_PATH}
                element={<UserSettingsSecurityPage />}
              />
            </Route>
            <Route
              path="settings"
              element={<AppConfigPage />}
            >
              {appConfig.map((item) => (
                <Route
                  key={item.name}
                  path={item.name}
                  element={<AppConfigPage />}
                />
              ))}
            </Route>
            {appConfig.map((item) =>
              item.appType === AppIntegrationType.NATIVE ? (
                <Route
                  key={item.name}
                  path={item.name}
                  element={pageSwitch(item.name)}
                />
              ) : null,
            )}
          </Route>

          <Route element={<BlankLayout />}>
            <Route
              path="*"
              element={
                <Navigate
                  replace
                  to="/"
                />
              }
            />
            {appConfig.map((item) =>
              item.appType === AppIntegrationType.FORWARDED ? (
                <Route
                  key={item.name}
                  path={item.name}
                  element={<ForwardingPage />}
                />
              ) : null,
            )}
          </Route>

          <Route>
            {appConfig.map((item) =>
              item.appType === AppIntegrationType.EMBEDDED ? (
                <Route
                  key={item.name}
                  path={item.name}
                  element={<FramePlaceholder />}
                />
              ) : null,
            )}
          </Route>
        </>
      ),
    ),
  );

export default createRouter;
