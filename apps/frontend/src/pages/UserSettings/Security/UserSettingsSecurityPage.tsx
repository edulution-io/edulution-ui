import React from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import Separator from '@/components/ui/Separator';
import PasswordChangeForm from '@/pages/UserSettings/Security/components/PasswordChangeForm';
import AddMfaForm from './components/AddMfaForm';

const UserSettingsSecurityPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bottom-8 left-4 right-0 top-3 h-screen md:left-64 md:right-[--sidebar-width]">
      <NativeAppHeader
        title={t('usersettings.security.title')}
        description={t('usersettings.security.description')}
        iconSrc={SecurityIcon}
      />
      <div className="p-4">
        <PasswordChangeForm />
        <Separator className="my-1 bg-ciGrey" />
        <AddMfaForm />
      </div>
    </div>
  );
};

export default UserSettingsSecurityPage;
