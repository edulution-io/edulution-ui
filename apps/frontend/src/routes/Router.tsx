import React, { useEffect } from 'react';
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

  return <RouterProvider router={router(auth)} />;
};
export default AppRouter;
