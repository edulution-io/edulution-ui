import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { HomePage } from '@/pages/Home';
import { ConferencePage } from '@/pages/ConferencePage';
import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import FileSharing from '@/pages/FileSharing/FileSharing';
import { RoomBookingPage } from '@/pages/RoomBookingPage';
import { SettingsPage } from '@/pages/Settings';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/conferences"
          element={<ConferencePage />}
        />
        <Route
          path="/file-sharing"
          element={<FileSharing />}
        />
        <Route
          path="/room-booking"
          element={<RoomBookingPage />}
        />
        <Route
          path="/settings/*"
          element={<SettingsPage />}
        />
      </Route>

      <Route element={<BlankLayout />}>
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>
    </>,
  ),
);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;
