/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
