import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/Home';
import { ConferencePage } from '@/pages/ConferencePage';
import MainLayout from '@/components/layout/MainLayout';
import BlankLayout from '@/components/layout/BlankLayout';
import FileSharing from '@/pages/FileSharing/FileSharing';
import { RoomBookingPage } from '@/pages/RoomBookingPage';
import LoginPage from '@/pages/LoginPage/LoginPage';
import { useAuth, AuthContextProps } from 'react-oidc-context';

const router = (auth: AuthContextProps) =>
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
          </Route>
        </>
      ),
    ),
  );

const AppRouter = () => {
  const auth = useAuth();

  return <RouterProvider router={router(auth)} />;
};
export default AppRouter;
