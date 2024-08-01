import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import BlankLayout from '@/components/layout/BlankLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';

const AuthRoutes = [
  <Route
    key="loginRoute"
    element={<BlankLayout />}
  >
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
  </Route>,
];

export default AuthRoutes;
