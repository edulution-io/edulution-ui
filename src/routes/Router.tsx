import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/Home';
// import { ConferencePage } from '@/pages/ConferencePage';
import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
// import FileSharing from '@/pages/FileSharing/FileSharing';
import { RoomBookingPage } from '@/pages/RoomBookingPage';
import { SettingsPage } from '@/pages/Settings';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import { ConferencePage } from '@/pages/ConferencePage';
import IframeLayout from '@/components/layout/IframeLayout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="conferences"
          element={<ConferencePage />}
        />
        {/* <Route
          path="/filesharing"
          element={<FileSharing />}
        /> */}
        <Route
          path="roombooking"
          element={<RoomBookingPage />}
        />
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
        <Route
          path="mail"
          element={<ForwardingPage />}
        />
      </Route>
      <Route element={<IframeLayout />}>
        <Route path="filesharing" />
      </Route>
    </>,
  ),
);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;
