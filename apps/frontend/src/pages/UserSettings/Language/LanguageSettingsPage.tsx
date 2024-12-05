import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { LanguageIcon } from '@/assets/icons';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import UserLanguage from '@libs/user/constants/userLanguage';
import useUserStore from '@/store/UserStore/UserStore';
import useElementHeight from '@/hooks/useElementHeight';
import { FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import LanguageSelector from './components/LanguageSelector';

const LanguageSettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const methods = useForm({
    defaultValues: {
      usersettings: {
        userLanguage: user?.language || UserLanguage.SYSTEM,
      },
    },
  });

  const pageBarsHeight = useElementHeight([NATIVE_APP_HEADER_ID, FOOTER_ID]);

  return (
    <FormProvider {...methods}>
      <div className="bottom-8 left-4 right-0 top-3 h-screen overflow-y-hidden md:left-64 md:right-[--sidebar-width]">
        <NativeAppHeader
          title={t('usersettings.language.title')}
          description={t('usersettings.language.description')}
          iconSrc={LanguageIcon}
        />
        <div
          className="w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
          style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
        >
          <LanguageSelector settingLocation="usersettings" />
        </div>
      </div>
    </FormProvider>
  );
};

export default LanguageSettingsPage;
