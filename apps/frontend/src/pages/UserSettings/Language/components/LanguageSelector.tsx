/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import UserLanguage from '@libs/user/constants/userLanguage';
import useUserStore from '@/store/UserStore/useUserStore';
import useMedia from '@/hooks/useMedia';
import UserLanguageType from '@libs/user/types/userLanguageType';
import { EnglishIcon, GermanIcon, FranceIcon, SettingsIcon } from '@/assets/icons';

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
    {
      value: UserLanguage.FRENCH,
      translationId: `${settingLocation}.language.french`,
      disabled: false,
      icon: FranceIcon,
    },
  ];

  const { user, updateUserLanguage } = useUserStore();
  const { control } = useFormContext();

  const { isMobileView } = useMedia();

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
        items={languageOptions}
        imageWidth={isMobileView ? 'small' : 'large'}
        fixedImageSize
      />
    </div>
  );
};

export default LanguageSelector;
