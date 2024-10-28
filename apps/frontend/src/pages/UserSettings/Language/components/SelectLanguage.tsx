import React, { useEffect } from 'react';
import { Control, useWatch } from 'react-hook-form';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import UserLanguage from '@libs/user/constants/userLanguage';
import { NativeIcon } from '@/assets/icons';
import useUserStore from '@/store/UserStore/UserStore';

interface SelectLanguageProps {
  control: Control;
  settingLocation: string;
}

const SelectLanguage: React.FC<SelectLanguageProps> = ({ control, settingLocation }) => {
  const languageOptions = [
    {
      value: UserLanguage.GERMAN,
      translationId: `${settingLocation}.language.german`,
      disabled: false,
      icon: NativeIcon,
    },
    {
      value: UserLanguage.ENGLISH,
      translationId: `${settingLocation}.language.english`,
      disabled: false,
      icon: NativeIcon,
    },
    {
      value: UserLanguage.SYSTEM_LANGUAGE,
      translationId: `${settingLocation}.language.system`,
      disabled: false,
      icon: NativeIcon,
    },
  ];

  const { user, updateUserLanguage } = useUserStore();

  const selectedLanguage = useWatch({
    control,
    name: `${settingLocation}.userLanguage`,
    defaultValue: UserLanguage.SYSTEM_LANGUAGE,
  }) as (typeof UserLanguage)[keyof typeof UserLanguage];

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
    />
  );
};

export default SelectLanguage;
