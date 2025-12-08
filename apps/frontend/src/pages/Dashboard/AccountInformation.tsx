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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  USER_SETTINGS_SECURITY_PATH,
  USER_SETTINGS_USER_DETAILS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import useLmnApiStore from '@/store/useLmnApiStore';
import Field from '@/components/shared/Field';

const AccountInformation = () => {
  const { user, lmnApiToken, getOwnUser } = useLmnApiStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (lmnApiToken) {
      void getOwnUser();
    }
  }, [lmnApiToken]);

  const userInfoFields = [
    { name: 'name', label: t('accountData.name'), value: user?.displayName || '...', readOnly: true },
    {
      name: 'mail',
      label: t('accountData.email'),
      value: (user?.mail && user.mail.length > 0 && user.mail.at(0)) || '...',
      readOnly: true,
    },
    { name: 'school', label: t('accountData.school'), value: user?.school || '...', readOnly: true },
    { name: 'role', label: t('accountData.role'), value: t(user?.sophomorixRole || '...'), readOnly: true },
  ];

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%]"
    >
      <CardContent className="flex flex-col gap-2">
        <h3 className="mb-4 font-bold">{t('accountData.account_info')}</h3>
        {userInfoFields.map((field) => (
          <Field
            key={`userInfoField-${field.name}`}
            value={field.value}
            labelTranslationId={field.label}
            readOnly={field.readOnly}
            variant="lightGrayDisabled"
          />
        ))}
        <Button
          className="mt-4"
          variant="btn-collaboration"
          size="sm"
          onClick={() => navigate(USER_SETTINGS_SECURITY_PATH)}
        >
          {t('accountData.change_password')}
        </Button>
        <Button
          variant="btn-collaboration"
          size="sm"
          onClick={() => navigate(USER_SETTINGS_USER_DETAILS_PATH)}
        >
          {t('accountData.change_my_data')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
