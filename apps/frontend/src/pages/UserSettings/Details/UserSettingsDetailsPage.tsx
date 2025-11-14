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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import { UserDetailsSettingsIcon } from '@/assets/icons';
import UserSettingsDetailsForm from '@/pages/UserSettings/Details/UserSettingsDetailsForm';
import Quota from '@/pages/Dashboard/Quota';
import Separator from '@/components/ui/Separator';
import Field from '@/components/shared/Field';
import Label from '@/components/ui/Label';
import BadgeField from '@/components/shared/BadgeField';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import PageLayout from '@/components/structure/layout/PageLayout';
import UserImageConfig from './UserImageConfig';

const UserSettingsDetailsPage: React.FC = () => {
  const { t } = useTranslation();

  const { user, lmnApiToken, getOwnUser } = useLmnApiStore();

  useEffect(() => {
    if (lmnApiToken) {
      void getOwnUser();
    }
  }, [lmnApiToken]);

  const userInfo = useMemo(
    () => [
      { name: 'name', label: t('usersettings.details.name'), value: user?.name },
      { name: 'displayName', label: t('usersettings.details.displayName'), value: user?.displayName },
      { name: 'dateOfBirth', label: t('usersettings.details.dateOfBirth'), value: user?.sophomorixBirthdate },
      { name: 'email', label: t('accountData.email'), value: user?.mail?.[0] },
      { name: 'schoolName', label: t('usersettings.details.schoolName'), value: user?.school },
      { name: 'role', label: t('usersettings.details.role'), value: t(user?.sophomorixRole || '') },
    ],
    [user, t],
  );

  const schoolClasses = user?.schoolclasses.map((item) => removeSchoolPrefix(item, user.school)) || [];

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('usersettings.details.title'),
        description: t('usersettings.details.description'),
        iconSrc: UserDetailsSettingsIcon,
      }}
    >
      <UserImageConfig />
      <Separator className="my-4 bg-muted" />

      <div className="md:max-w-[75%]">
        <h3 className="text-background">{t('usersettings.details.userInformation')}</h3>
        <div className="py-4 text-background">
          {userInfo.map((field) => (
            <Field
              key={`userInfoField-${field.name}`}
              value={field.value}
              labelTranslationId={field.label}
              className="mb-4 mt-2"
              disabled
            />
          ))}

          <Label>
            <p className="font-bold">{t('usersettings.details.schoolSubjects')}</p>
          </Label>
          <BadgeField
            value={schoolClasses}
            readOnly
            className="mt-2"
          />
        </div>
      </div>
      <Separator className="my-4 bg-muted" />

      <h3 className="text-background">{t('usersettings.details.title')}</h3>
      <div className="mb-4 space-y-4 py-4">
        <UserSettingsDetailsForm />
      </div>

      <Separator className="my-4 bg-muted" />

      <div className="md:max-w-[75%]">
        <h3 className="text-background">{t('usersettings.details.quotas')}</h3>
        <div className="py-4 text-muted">
          <Quota />
        </div>

        <div className="h-[50px]" />
      </div>
    </PageLayout>
  );
};

export default UserSettingsDetailsPage;
