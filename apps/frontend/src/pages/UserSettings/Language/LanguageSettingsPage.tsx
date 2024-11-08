import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { LanguageIcon } from '@/assets/icons';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import UserLanguage from '@libs/user/constants/userLanguage';
import useUserStore from '@/store/UserStore/UserStore';
import LanguageSelector from './components/LanguageSelector';

const LanguageSettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const methods = useForm({
    defaultValues: {
      usersettings: {
        userLanguage: user?.language || UserLanguage.GERMAN,
      },
    },
  });

  return (
    <FormProvider {...methods}>
      <div className="left-4 right-0 top-3 h-screen overflow-y-auto md:left-64 md:right-[--sidebar-width]">
        <NativeAppHeader
          title={t('usersettings.language.title')}
          description={t('usersettings.language.description')}
          iconSrc={LanguageIcon}
        />
        <div className="p-4">
          <LanguageSelector settingLocation="usersettings" />
        </div>
      </div>
    </FormProvider>
  );
};

export default LanguageSettingsPage;
