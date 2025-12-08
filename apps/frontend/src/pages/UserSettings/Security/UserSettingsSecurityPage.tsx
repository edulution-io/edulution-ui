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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityIcon } from '@/assets/icons';
import PasswordChangeForm from '@/pages/UserSettings/Security/components/PasswordChangeForm';
import Separator from '@/components/ui/Separator';
import PageLayout from '@/components/structure/layout/PageLayout';
import AddMfaForm from './components/AddMfaForm';
import UserAccountsTable from './components/UserAccountsTable';

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
      <Separator className="my-1 bg-muted" />
      <UserAccountsTable />
    </PageLayout>
  );
};

export default UserSettingsSecurityPage;
