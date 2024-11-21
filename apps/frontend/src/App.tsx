import React, { useEffect } from 'react';
import AppRouter from '@/router/AppRouter';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import eduApi from '@/api/eduApi';
import BBBFrame from '@/pages/ConferencePage/BBBFrame';
import EmbeddedIframes from '@/components/framing/EmbeddedIframes';
import NativeFrames from '@/components/framing/Native/NativeFrames';
import useLmnApiStore from '@/store/useLmnApiStore';
import lmnApi from '@/api/lmnApi';
import useUserStore from '@/store/UserStore/UserStore';
import Toaster from '@/components/ui/Sonner';
import { WebStorageStateStore } from 'oidc-client-ts';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import i18n from '@/i18n';
import VDIFrame from './pages/DesktopDeployment/VDIFrame';
import CommunityLicenseDialog from './pages/UserSettings/Info/CommunityLicenseDialog';

const App = () => {
  const { eduApiToken } = useUserStore();
  const { lmnApiToken } = useLmnApiStore();
  const { user } = useUserStore();

  lmnApi.defaults.headers.common[HTTP_HEADERS.XApiKey] = lmnApiToken;
  eduApi.defaults.headers.Authorization = `Bearer ${eduApiToken}`;

  useEffect(() => {
    if (user?.language && user.language !== 'system') {
      i18n.changeLanguage(user.language).catch((e) => console.error('Change Language Error', e));
    } else {
      i18n.changeLanguage(undefined).catch((e) => console.error('Reset to System Language Error', e));
    }
  }, [user?.language]);

  const oidcConfig: AuthProviderProps = {
    authority: `${window.location.origin}/${EDU_API_ROOT}/auth`,
    client_id: ' ',
    client_secret: ' ',
    redirect_uri: '',
    loadUserInfo: true,
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({
      store: localStorage,
    }),
  };

  return (
    <AuthProvider {...oidcConfig}>
      <BBBFrame />
      <VDIFrame />
      <AppRouter />
      <EmbeddedIframes />
      <NativeFrames />
      <CommunityLicenseDialog />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
