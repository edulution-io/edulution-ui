import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { HomePage } from '@/pages/Home';
import { ConferencePage } from '@/pages/ConferencePage';
import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import { RoomBookingPage } from '@/pages/RoomBookingPage';
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';

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
          element={<FileSharingPage />}
        />
        <Route
          path="/room-booking"
          element={<RoomBookingPage />}
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
