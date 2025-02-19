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
          <LanguageSelector settingLocation="usersettings" />
        </div>
      </div>
    </FormProvider>
  );
};

export default LanguageSettingsPage;
