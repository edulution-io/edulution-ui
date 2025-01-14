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
      <CardContent>
        <div className="flex flex-col gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
