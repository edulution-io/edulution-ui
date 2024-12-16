import UserAppearance from '@libs/user/constants/userAppearance';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import { FormProvider, useForm } from 'react-hook-form';
import useElementHeight from '@/hooks/useElementHeight';
import { FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { LanguageIcon } from '@/assets/icons';
import React from 'react';

const AppearanceSettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const methods = useForm({
    defaultValues: {
      usersettings: {
        userAppearance: user?.appearance || UserAppearance.SYSTEM,
      },
    },
  });

  const pageBarsHeight = useElementHeight([NATIVE_APP_HEADER_ID, FOOTER_ID]);

  return (
    <FormProvider {...methods}>
      <div className="h-screen overflow-y-hidden">
        <NativeAppHeader
          title={t('usersettings.language.title')}
          description={t('usersettings.language.description')}
          iconSrc={LanguageIcon}
        />
        <div
          className="w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
          style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
        >
          {/* <LanguageSelector settingLocation="usersettings" /> */}
        </div>
      </div>
    </FormProvider>
  );
};

export default AppearanceSettingsPage;
