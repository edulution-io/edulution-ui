import React from 'react';
import { useTranslation } from 'react-i18next';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import { SecurityIcon } from '@/assets/icons';
import PasswordChangeForm from '@/pages/UserSettings/Security/components/PasswordChangeForm';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import Separator from '@/components/ui/Separator';
import AddMfaForm from './components/AddMfaForm';

const UserSettingsSecurityPage: React.FC = () => {
  const { t } = useTranslation();

  const pageBarsHeight = useElementHeight([NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) + 10;

  return (
    <div className="h-screen overflow-y-hidden">
      <div className="flex flex-row justify-between">
        <NativeAppHeader
          title={t('usersettings.security.title')}
          description={t('usersettings.security.description')}
          iconSrc={SecurityIcon}
        />
      </div>
      <div
        className="w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <PasswordChangeForm />
        <Separator className="my-1 bg-ciGrey" />
        <AddMfaForm />
      </div>
    </div>
  );
};

export default UserSettingsSecurityPage;
