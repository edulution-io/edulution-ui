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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityIcon } from '@/assets/icons';
import PasswordChangeForm from '@/pages/UserSettings/Security/components/PasswordChangeForm';
import Separator from '@/components/ui/Separator';
import PageLayout from '@/components/structure/layout/PageLayout';
import AddMfaForm from './components/AddMfaForm';

const UserSettingsSecurityPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('usersettings.security.title'),
        description: t('usersettings.security.description'),
        iconSrc: SecurityIcon,
      }}
    >
      <PasswordChangeForm />
      <Separator className="my-1 bg-muted" />
      <AddMfaForm />
    </PageLayout>
  );
};

export default UserSettingsSecurityPage;
