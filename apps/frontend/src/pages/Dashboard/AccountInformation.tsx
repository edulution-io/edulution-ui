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
  const { user, getOwnUser } = useLmnApiStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) {
      void getOwnUser();
    }
  }, [user]);

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
        <h4 className="mb-4 font-bold">{t('accountData.account_info')}</h4>
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
