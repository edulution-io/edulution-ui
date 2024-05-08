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

import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import useAppConfigsStore from '@/store/appConfigsStore';
import useAppConfigQuery from '@/api/useAppConfigQuery';
import useUserStore from '@/store/userStore';
import useUserQuery from '@/api/useUserQuery';

import SurveyPage from '@/pages/Survey/SurveyPage';
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
              element={<SettingsPage />}
            >
              {appConfig.map((item) => (
                <Route
                  key={item.name}
                  path={item.name}
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
  const { appConfig, setAppConfig } = useAppConfigsStore();
  const { getAppConfigs } = useAppConfigQuery();
  const { isAuthenticated } = useUserStore();
  const { loginUser } = useUserQuery();
  const { setIsLoggedInInEduApi, isLoggedInInEduApi } = useUserStore();

  useEffect(() => {
    if (auth.user && auth.isAuthenticated && !isLoggedInInEduApi) {
      const { profile } = auth.user;

      // Send here the user password for Webdav to the API
      loginUser(profile)
        .then(() => setIsLoggedInInEduApi(true))
        .catch((e) => console.error(e));
    }
  }, [auth.isAuthenticated, auth.user?.profile]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const fetchData = async () => {
        try {
          const configData = await getAppConfigs();
          if (configData) {
            setAppConfig(configData);
          }
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
          console.log('Session expired');
          auth.removeUser().catch((e) => console.error('Error fetching data:', e));
          setIsLoggedInInEduApi(false);
          sessionStorage.clear();
        }
      });
    }
  }, [auth.events, auth.isAuthenticated]);

  return <RouterProvider router={router(isAuthenticated, appConfig)} />;
};
export default AppRouter;
