import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import HomePage from '@/pages/Home/HomePage';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import LoginPage from '@/pages/LoginPage/LoginPage';

import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import { AppConfigDto, AppIntegrationType, APPS } from '@libs/appconfig/types';
import { SECURITY_PATH, USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import NativeAppPage from '@/pages/NativeAppPage/NativeAppPage';
import useLdapGroups from '@/hooks/useLdapGroups';
import ParticipatePublicSurvey from '@/pages/PublicPage/ParticipatePublicSurvey';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/api/surveys-endpoint';

const createRouter = (isAuthenticated: boolean, appConfig: AppConfigDto[]) => {
  const { isSuperAdmin } = useLdapGroups();

  return createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<BlankLayout />}>
          <Route>
            path={PUBLIC_SURVEYS_ENDPOINT}
            <Route
              path={`${PUBLIC_SURVEYS_ENDPOINT}/*`}
              element={<ParticipatePublicSurvey />}
            />
          </Route>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate
                  replace
                  to="/"
                />
              ) : (
                <Navigate
                  replace
                  to="/login"
                  state={{ from: window.location.pathname }}
                />
              )
            }
          />
        </Route>
        {isAuthenticated ? (
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
                  element={<UserSettingsSecurityPage />}
                />
                <Route
                  path={SECURITY_PATH}
                  element={<UserSettingsSecurityPage />}
                />
              </Route>
              {isSuperAdmin ? (
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
              ) : null}
              {appConfig.map((item) =>
                item.appType === AppIntegrationType.NATIVE ? (
                  <Route
                    key={item.name}
                    path={item.name}
                    element={<NativeAppPage page={item.name as APPS} />}
                  />
                ) : null,
              )}
            </Route>

            <Route element={<BlankLayout />}>
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
        ) : null}
      </>,
    ),
  );
};

export default createRouter;
