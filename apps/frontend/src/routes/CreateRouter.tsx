import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import IframePlaceholder from '@/components/layout/Embedded/IframePlaceholder';

import { HomePage } from '@/pages/Home';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import FileSharing from '@/pages/FileSharing/FileSharing';
import ConferencePage from '@/pages/ConferencePage/ConferencePage';
import RoomBookingPage from '@/pages/RoomBookingPage/RoomBookingPage';
import LoginPage from '@/pages/LoginPage/LoginPage';
import PollsAndSurveysPage from '@/pages/PollsAndSurveysPage/PollsAndSurveysPage';

import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import SchoolManagementPage from '@/pages/SchoolmanagementPage/SchoolManagementPage';
import UserSettings from '@/pages/UserSettings/UserSettings';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import Whiteboard from '@/pages/Whiteboard/Whiteboard';
import FAQPage from '@/pages/FAQ/FAQPage';

const pageSwitch = (page: string) => {
  switch (page as APPS) {
    case APPS.CONFERENCES:
      return <ConferencePage />;
    case APPS.FILE_SHARING:
      return <FileSharing />;
    case APPS.ROOM_BOOKING:
      return <RoomBookingPage />;
    case APPS.WHITEBOARD:
      return <Whiteboard />;
    case APPS.MAIL:
      return <IframePlaceholder />;
    case APPS.SURVEYS:
      return <PollsAndSurveysPage />;
    case APPS.DESKTOP_DEPLOYMENT:
      return <DesktopDeploymentPage />;

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
            <Route
              path="faq"
              element={<FAQPage />}
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
              item.appType === AppIntegrationType.EMBEDDED ? (
                <Route
                  key={item.name}
                  path={item.name}
                  element={<IframePlaceholder />}
                />
              ) : null,
            )}
          </Route>
        </>
      ),
    ),
  );

export default createRouter;
