import React, { useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useLocalStorage } from 'usehooks-ts';

import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import IframeLayout from '@/components/layout/IframeLayout';

import { HomePage } from '@/pages/Home';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';

import PollEditor from '@/pages/Survey/Poll/PollEditor';
import { SurveyCreatorWidget } from '@/pages/Survey/Forms/SurveyCreatorWidget';

import FileSharing from '@/pages/FileSharing/FileSharing';
import { ConferencePage } from '@/pages/ConferencePage';
import { RoomBookingPage } from '@/pages/RoomBookingPage';
import { SettingsPage } from '@/pages/Settings';
import LoginPage from '@/pages/LoginPage/LoginPage';
import SurveyPage from '@/pages/Survey/SurveyPage';

import { APPS, AppType, ConfigType } from '@/datatypes/types';
import PollMockup from '@/pages/Survey/Poll/PollMockup';

const pageSwitch = (page: string) => {
  switch (page as APPS) {
    case APPS.CONFERENCES:
      return <ConferencePage />;
    case APPS.FILE_SHARING: {
      return <FileSharing />;
    }
    case APPS.ROOM_BOOKING: {
      return <RoomBookingPage />;
    }
    default: {
      return (
        <Navigate
          replace
          to="/"
        />
      );
    }
  }
};

const router = (isAuthenticated: boolean, config: ConfigType) =>
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
              path="settings"
              element={<SettingsPage />}
            >
              {Object.keys(config).map((key) => (
                <Route
                  key={key}
                  path={key}
                  element={<SettingsPage />}
                />
              ))}
            </Route>

            <Route
              path="survey"
              element={<SurveyPage />}
            >
              {Object.keys(config).map((key) => (
                <Route
                  key={key}
                  path={key}
                  element={<SurveyPage />}
                />
              ))}
            </Route>

            <Route
              path="survey/forms/create"
              element={<SurveyCreatorWidget />}
            >
              {Object.keys(config).map((key) => (
                <Route
                  key={key}
                  path={key}
                  element={<SurveyCreatorWidget />}
                />
              ))}
            </Route>
            <Route
              path="survey/poll"
              element={<PollMockup />}
            >
              {Object.keys(config).map((key) => (
                <Route
                  key={key}
                  path={key}
                  element={<PollMockup />}
                />
              ))}
            </Route>
            <Route
              path="survey/poll/create"
              element={<PollEditor />}
            >
              {Object.keys(config).map((key) => (
                <Route
                  key={key}
                  path={key}
                  element={<PollEditor />}
                />
              ))}
            </Route>
            {Object.keys(config).map((key) =>
              config[key].appType === AppType.NATIVE ? (
                <Route
                  key={key}
                  path={key}
                  element={pageSwitch(key)}
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
            {Object.keys(config).map((key) =>
              config[key].appType === AppType.FORWARDED ? (
                <Route
                  key={key}
                  path={key}
                  element={<ForwardingPage />}
                />
              ) : null,
            )}
          </Route>

          <Route element={<IframeLayout />}>
            {Object.keys(config).map((key) =>
              config[key].appType === AppType.EMBEDDED ? (
                <Route
                  key={key}
                  path={key}
                  element={null}
                />
              ) : null,
            )}
          </Route>
        </>
      ),
    ),
  );

const AppRouter = () => {
  const auth = useAuth();
  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    if (auth.isAuthenticated) {
      auth.events.addAccessTokenExpiring(() => {
        if (auth.user?.expired) {
          console.log('Session expired');
          auth.removeUser().catch(console.error);
          sessionStorage.clear();
        }
      });
    }
  }, [auth.events, auth.isAuthenticated]);

  return <RouterProvider router={router(isAuthenticated, config)} />;
};
export default AppRouter;
