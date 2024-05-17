import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Router from '@/routes/Router';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import eduApi from '@/api/eduApi';
import useUserStore from './store/userStore';

const queryClient = new QueryClient();

const App = () => {
  const { lang } = useLanguage();
  const { token } = useUserStore();

  eduApi.defaults.headers.Authorization = `Bearer ${token}`;

  useEffect(() => {
    i18n.changeLanguage(lang).catch((e) => console.error('Change Language Error', e));
  }, [lang]);

  const oidcConfig: AuthProviderProps = {
    authority: `${window.location.origin}/auth/realms/${import.meta.env.VITE_AUTH_REALM}`,
    client_id: import.meta.env.VITE_AUTH_CLIENT_ID as string,
    client_secret: import.meta.env.VITE_AUTH_CLIENT_SECRET as string,
    redirect_uri: `${window.location.origin}`,
    loadUserInfo: true,
    automaticSilentRenew: true,
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
