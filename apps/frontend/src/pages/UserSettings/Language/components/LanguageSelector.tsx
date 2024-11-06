import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import UserLanguage from '@libs/user/constants/userLanguage';
import { EnglishIcon, GermanIcon, SettingsIcon } from '@/assets/icons';
import useUserStore from '@/store/UserStore/UserStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import UserLanguageType from '@libs/user/types/userLanguageType';

interface SelectLanguageProps {
  settingLocation: string;
}

const LanguageSelector: React.FC<SelectLanguageProps> = ({ settingLocation }) => {
  const languageOptions = [
    {
      value: UserLanguage.GERMAN,
      translationId: `${settingLocation}.language.german`,
      disabled: false,
      icon: GermanIcon,
    },
    {
      value: UserLanguage.ENGLISH,
      translationId: `${settingLocation}.language.english`,
      disabled: false,
      icon: EnglishIcon,
    },
    {
      value: UserLanguage.SYSTEM_LANGUAGE,
      translationId: `${settingLocation}.language.system`,
      disabled: false,
      icon: SettingsIcon,
    },
  ];

  const { user, updateUserLanguage } = useUserStore();
  const { control } = useFormContext();

  const isMobileView = useIsMobileView();

  const selectedLanguage = useWatch({
    control,
    name: `${settingLocation}.userLanguage`,
  }) as UserLanguageType;

  useEffect(() => {
    if (selectedLanguage !== user?.language) {
      void updateUserLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  return (
    <RadioGroupFormField
      control={control}
      name={`${settingLocation}.userLanguage`}
      titleTranslationId={`${settingLocation}.language.title`}
      defaultValue={selectedLanguage}
      items={languageOptions}
      imageSize={isMobileView ? 'small' : 'large'}
    />
  );
};

export default LanguageSelector;
