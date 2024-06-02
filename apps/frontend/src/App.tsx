import React, { useEffect } from 'react';
import AppRouter from '@/routes/AppRouter';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import useUserStore from '@/store/userStore';
import eduApi from '@/api/eduApi';
import BBBFrame from '@/pages/ConferencePage/BBBFrame';
import EmbeddedIframes from '@/components/layout/Embedded/EmbeddedIframes';
import NativeFrames from '@/components/layout/Native/NativeIframes';
import useLmnUserStore from '@/store/lmnApiStore';
import lmnApi from '@/api/lmnApi';
import Toaster from '@/components/ui/Sonner';

const App = () => {
  const { lang } = useLanguage();
  const { token } = useUserStore();
  const { lmnApiToken } = useLmnUserStore();

  lmnApi.defaults.headers.common['x-api-key'] = lmnApiToken;
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
      <BBBFrame />
      <AppRouter />
      <EmbeddedIframes />
      <NativeFrames />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
