import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { USER_SETTINGS_SECURITY_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import useLmnApiStore from '@/store/useLmnApiStore';

const AccountInformation = () => {
  const { user } = useLmnApiStore();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const userInfoFields = [
    { label: t('accountData.name'), value: user?.displayName || '...' },
    {
      label: t('accountData.email'),
      value: (user?.mail && user.mail.length > 0 && user.mail.at(0)) || '...',
    },
    { label: t('accountData.school'), value: user?.school || '...' },
    { label: t('accountData.role'), value: user?.sophomorixRole || '...' },
  ];

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%]"
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('accountData.account_info')}</h4>
          {userInfoFields.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col"
            >
              <p className="text-nowrap">
                {label}: {value}
              </p>
            </div>
          ))}
          <Button
            variant="btn-collaboration"
            size="sm"
            onClick={() => navigate(USER_SETTINGS_SECURITY_PATH)}
          >
            {t('accountData.change_password')}
          </Button>
        </div>
        <div className="mt-6">
          <h4 className="font-bold">{t('accountData.my_information')}</h4>
          {user?.mail && user?.mail.length > 1 && (
            <>
              <p>{t('accountData.mail_alias')}</p>
              {user?.mail.slice(1).map((mail) => (
                <div key={mail}>
                  <p>{mail}</p>
                </div>
              ))}
            </>
          )}
          <Button
            variant="btn-collaboration"
            className="mt-4"
            size="sm"
          >
            {t('accountData.change_my_data')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
