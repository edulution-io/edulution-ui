import React, { useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/Home';

import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import IframeLayout from '@/components/layout/IframeLayout';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';

import FileSharing from '@/pages/FileSharing/FileSharing';
import { ConferencePage } from '@/pages/ConferencePage';
import { RoomBookingPage } from '@/pages/RoomBookingPage';
import { SettingsPage } from '@/pages/Settings';
import LoginPage from '@/pages/LoginPage/LoginPage';
import { useAuth } from 'react-oidc-context';

import { APPS, AppType, ConfigType } from '@/datatypes/types';
import { useLocalStorage } from 'usehooks-ts';
import FileEditingPage from '@/pages/FileEditor/FileEditingPage';

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
    case APPS.FILE_PREVIEW: {
      return <FileEditingPage />;
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
