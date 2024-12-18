import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import UserLanguage from '@libs/user/constants/userLanguage';
import useUserStore from '@/store/UserStore/UserStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import UserLanguageType from '@libs/user/types/userLanguageType';
import { EnglishIcon, GermanIcon, SettingsIcon } from '@/assets/icons';

interface SelectLanguageProps {
  settingLocation: string;
}

const LanguageSelector: React.FC<SelectLanguageProps> = ({ settingLocation }) => {
  const languageOptions = [
    {
      value: UserLanguage.SYSTEM,
      translationId: `${settingLocation}.language.system`,
      disabled: false,
      icon: SettingsIcon,
    },
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
    <div className="pb-4">
      <RadioGroupFormField
        control={control}
        name={`${settingLocation}.userLanguage`}
        defaultValue={selectedLanguage}
        items={languageOptions}
        imageWidth={isMobileView ? 'small' : 'large'}
        fixedImageSize
      />
    </div>
  );
};

export default LanguageSelector;
