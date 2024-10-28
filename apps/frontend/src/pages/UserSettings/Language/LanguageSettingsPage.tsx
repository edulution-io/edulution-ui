import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { LanguageIcon } from '@/assets/icons';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import UserLanguage from '@libs/user/constants/userLanguage';
import SelectLanguage from './components/SelectLanguage';

const LanguageSettingsPage = () => {
  const { t } = useTranslation();

  const methods = useForm({
    defaultValues: {
      userLanguage: UserLanguage.SYSTEM_LANGUAGE,
    },
  });

  return (
    <FormProvider {...methods}>
      <div className="bottom-8 left-4 right-0 top-3 h-screen md:left-64 md:right-[--sidebar-width]">
        <NativeAppHeader
          title={t('usersettings.language.title')}
          description={t('usersettings.language.description')}
          iconSrc={LanguageIcon}
        />
        <div className="p-4">
          <SelectLanguage settingLocation="usersettings" />
        </div>
      </div>
    </FormProvider>
  );
};

export default LanguageSettingsPage;
