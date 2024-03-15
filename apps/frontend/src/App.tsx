import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Router from '@/routes/Router';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { AuthProvider } from 'react-oidc-context';

const queryClient = new QueryClient();

const App = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    i18n
      .changeLanguage(lang)
      .then(() => {})
      .catch(() => {});
  }, [lang, i18n]);

  const oidcConfig = {
    authority: 'http://localhost:8080/realms/master/',
    client_id: 'edulution-ui',
    redirect_uri: 'http://localhost:5173',
  };

  return (
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
