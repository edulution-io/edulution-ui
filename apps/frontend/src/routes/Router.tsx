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
import useAppDataStore from '@/store/appDataStore';
import useEduApi from '@/api/useEduApiQuery';

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

const router = (isAuthenticated: boolean, config: ConfigType[]) =>
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
              {config.map((item) => (
                <Route
                  key={item.name}
                  path={item.name}
                  element={<SettingsPage />}
                />
              ))}
            </Route>
            {config.map((item) =>
              item.appType === AppType.NATIVE ? (
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
            {config.map((item) =>
              item.appType === AppType.FORWARDED ? (
                <Route
                  key={item.name}
                  path={item.name}
                  element={<ForwardingPage />}
                />
              ) : null,
            )}
          </Route>

          <Route element={<IframeLayout />}>
            {config.map((item) =>
              item.appType === AppType.EMBEDDED ? (
                <Route
                  key={item.name}
                  path={item.name}
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
  const { config, setConfig } = useAppDataStore();
  const { getSettingsConfig } = useEduApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSettingsConfig();
        if (!response) {
          throw new Error('Network response was not ok');
        }
        const configData = response;
        setConfig(configData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch(console.error);
  }, []);

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
