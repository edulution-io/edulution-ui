import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Router from '@/routes/Router';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';

const queryClient = new QueryClient();

const App = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    i18n.changeLanguage(lang).catch((e) => {
      console.error(e);
    });
  }, [lang, i18n]);

  // TODO: Move config to backend NIEDUUI-26
  const oidcConfig: AuthProviderProps = {
    authority: `https://auth.schulung.multi.schule/auth/realms/edulution`,
    client_id: 'edulution-ui',
    redirect_uri: '',
    scope: 'openid',
    silent_redirect_uri: window.location.origin,
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
