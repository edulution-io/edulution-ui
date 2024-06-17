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
import LoginPage from '@/pages/LoginPage/LoginPage';
import { useAuth } from 'react-oidc-context';

import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import useAppConfigsStore from '@/store/appConfigsStore';
import useUserQuery from '@/api/useUserQuery';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import useUserStore from '@/store/UserStore/UserStore';
import MailPage from '@/pages/Mail/MailPage';

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
    case APPS.MAIL: {
      return <MailPage />;
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

const router = (isAuthenticated: boolean, appConfig: AppConfig[]) =>
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

          <Route element={<IframeLayout />}>
            {appConfig.map((item) =>
              item.appType === AppIntegrationType.EMBEDDED ? (
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
  const { appConfigs, getAppConfigs } = useAppConfigsStore();
  const { user: registeredUser } = useUserQuery();
  const { isAuthenticated, setIsLoggedInInEduApi, isLoggedInInEduApi } = useUserStore();

  useEffect(() => {
    if (auth.user && auth.isAuthenticated && !isLoggedInInEduApi) {
      const { profile } = auth.user;

      // Send here the user password for Webdav to the API
      registeredUser(profile)
        .then(() => setIsLoggedInInEduApi(true))
        .catch((e) => console.error(e));
    }
  }, [auth.isAuthenticated, auth.user?.profile]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const fetchData = async () => {
        try {
          await getAppConfigs();
        } catch (e) {
          console.error('Error fetching data:', e);
        }
      };

      fetchData().catch(() => null);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      auth.events.addAccessTokenExpiring(() => {
        if (auth.user?.expired) {
          console.info('Session expired');
          auth.removeUser().catch((e) => console.error('Error fetching data:', e));
          setIsLoggedInInEduApi(false);
          sessionStorage.clear();
        }
      });
    }
  }, [auth.events, auth.isAuthenticated]);

  return <RouterProvider router={router(isAuthenticated, appConfigs)} />;
};
export default AppRouter;
