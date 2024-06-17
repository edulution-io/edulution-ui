import React, { useEffect } from 'react';
import AppRouter from '@/routes/AppRouter';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import eduApi from '@/api/eduApi';
import BBBFrame from '@/pages/ConferencePage/BBBFrame';
import EmbeddedIframes from '@/components/layout/Embedded/EmbeddedIframes';
import NativeFrames from '@/components/layout/Native/NativeIframes';
import useLmnApiStore from '@/store/lmnApiStore';
import lmnApi from '@/api/lmnApi';
import useUserStore from '@/store/UserStore/UserStore';
import Toaster from '@/components/ui/Sonner';

const App = () => {
  const { lang } = useLanguage();
  const { eduApiToken } = useUserStore();
  const { lmnApiToken } = useLmnApiStore();

  lmnApi.defaults.headers.common['x-api-key'] = lmnApiToken;
  eduApi.defaults.headers.Authorization = `Bearer ${eduApiToken}`;

  useEffect(() => {
    i18n.changeLanguage(lang).catch((e) => console.error('Change Language Error', e));
  }, [lang]);

  const oidcConfig: AuthProviderProps = {
    authority: `${window.location.origin}/auth/realms/${import.meta.env.VITE_AUTH_REALM}`,
    client_id: import.meta.env.VITE_AUTH_CLIENT_ID as string,
    client_secret: import.meta.env.VITE_AUTH_CLIENT_SECRET as string,
    redirect_uri: '',
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
