import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import FramePlaceholder from '@/components/layout/Embedded/FramePlaceholder';

import { HomePage } from '@/pages/Home';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import FileSharing from '@/pages/FileSharing/FileSharing';
import ConferencePage from '@/pages/ConferencePage/ConferencePage';
import RoomBookingPage from '@/pages/RoomBookingPage/RoomBookingPage';
import LoginPage from '@/pages/LoginPage/LoginPage';

import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import UserSettings from '@/pages/UserSettings/UserSettings';
import SchoolManagementPage from '@/pages/SchoolmanagementPage/SchoolManagementPage';

const pageSwitch = (page: string) => {
  switch (page as APPS) {
    case APPS.CONFERENCES:
      return <ConferencePage />;
    case APPS.FILE_SHARING:
      return <FileSharing />;
    case APPS.ROOM_BOOKING:
      return <RoomBookingPage />;
    case APPS.WHITEBOARD:
      return <FramePlaceholder />;
    case APPS.MAIL:
      return <FramePlaceholder />;
    case APPS.SURVEYS:
      return <FramePlaceholder />;
    case APPS.DESKTOP_DEPLOYMENT:
      return <FramePlaceholder />;
    case APPS.LINUXMUSTER:
      return <FramePlaceholder />;

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

const shouldRenderEmbeddedRoute = (item: AppConfig, userRole: string) => {
  const { appType, name } = item;

  if (appType !== AppIntegrationType.EMBEDDED) {
    return false;
  }

  if (name === 'ticketsystem') {
    return userRole === 'globaladministrator';
  }

  return true;
};

const createRouter = (isAuthenticated: boolean, appConfig: AppConfig[], userRole: string) =>
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
              path="user"
              element={<UserSettings />}
            />

            {userRole !== 'student' && (
              <Route
                path="/schoolmanagement"
                element={<SchoolManagementPage />}
              />
            )}

            {userRole === 'globaladministrator' && (
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
            )}
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
              shouldRenderEmbeddedRoute(item, userRole) ? (
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
