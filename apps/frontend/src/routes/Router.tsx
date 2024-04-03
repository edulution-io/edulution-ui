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
import { useAuth, AuthContextProps } from 'react-oidc-context';

import { APPS, AppType, ConfigType } from '@/datatypes/types';
import { useLocalStorage } from 'usehooks-ts';

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

const router = (auth: AuthContextProps, config: ConfigType) =>
  createBrowserRouter(
    createRoutesFromElements(
      !auth.isAuthenticated ? (
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

  // useEffect(() => {
  //   const handleUserInteraction = () => {
  //     // Fügen Sie hier den Code hinzu, der bei Benutzerinteraktionen ausgeführt werden soll
  //     console.log('Benutzerinteraktion erkannt');

  //     auth.signinSilent({}).catch(console.error);
  //   };

  //   // Event-Listener für Benutzerinteraktionen hinzufügen
  //   document.addEventListener('mousedown', handleUserInteraction);
  //   document.addEventListener('keydown', handleUserInteraction);

  //   // Event-Listener entfernen, wenn die Komponente unmontiert wird
  //   return () => {
  //     document.removeEventListener('mousedown', handleUserInteraction);
  //     document.removeEventListener('keydown', handleUserInteraction);
  //   };
  // }, []);

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

  return <RouterProvider router={router(auth, config)} />;
};
export default AppRouter;
