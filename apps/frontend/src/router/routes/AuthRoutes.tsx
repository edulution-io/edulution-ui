import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import BlankLayout from '@/components/layout/BlankLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';

const getAuthRoutes = (isAuthenticated: boolean) => [
  <Route
    key="auth"
    element={<BlankLayout />}
  >
    <Route
      path="/login"
      element={<LoginPage />}
    />
    <Route
      path="*"
      element={
        isAuthenticated ? (
          <Navigate
            replace
            to="/"
          />
        ) : (
          <Navigate
            replace
            to="/login"
            state={{ from: window.location.pathname }}
          />
        )
      }
    />
  </Route>,
];

export default getAuthRoutes;
