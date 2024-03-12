import React from 'react';
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

import { ConfigType } from '@/datatypes/types';
import { useLocalStorage } from 'usehooks-ts';

const pageSwitch = (page: string) => {
  switch (page) {
    case 'conferences':
      return <ConferencePage />;
    case 'filesharing': {
      return <FileSharing />;
    }
    case 'roombooking': {
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

const router = (config: ConfigType) =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={<HomePage />}
          />
          <Route
            path="settings/*"
            element={<SettingsPage />}
          />
          {Object.keys(config).map((key) =>
            config[key].appType === 'native' ? (
              <Route
                key={key}
                path={`${key}`}
                element={pageSwitch(key)}
              />
            ) : null,
          )}
          <Route
            path="settings/*"
            element={<SettingsPage />}
          />
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
            config[key].appType === 'forwarded' ? (
              <Route
                key={key}
                path={`${key}`}
                element={<ForwardingPage />}
              />
            ) : null,
          )}
        </Route>

        <Route element={<IframeLayout />}>
          {Object.keys(config).map((key) =>
            config[key].appType === 'embedded' ? (
              <Route
                key={key}
                path={`${key}`}
                element={null}
              />
            ) : null,
          )}
        </Route>
      </>,
    ),
  );
const AppRouter = () => {
  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  return <RouterProvider router={router(config)} />;
};

export default AppRouter;
