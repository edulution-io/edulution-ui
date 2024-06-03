import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import userStore from '@/store/userStore';

const AccountInformation = () => {
  const { userInfo } = userStore();
  const { t } = useTranslation();
  const userInfoFields = [
    { label: t('accountData.name'), value: userInfo ? userInfo?.name : '...' },
    {
      label: t('accountData.email'),
      value: userInfo ? userInfo.email : '...',
    },
    { label: t('accountData.school'), value: userInfo ? userInfo?.ldapGroups?.school : '...' },
    { label: t('accountData.role'), value: userInfo ? userInfo?.ldapGroups?.role : '...' },
  ];

  return (
    <Card
      variant="security"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
