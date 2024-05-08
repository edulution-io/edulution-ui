import React, { useEffect } from 'react';
import useLmnUserStore from '@/store/lmnApiStore';
import { waitForToken } from '@/api/common';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

const AccountInformation = () => {
  const { userData, getUserData } = useLmnUserStore((state) => ({
    getUserData: state.getUserData,
    userData: state.userData,
  }));

  useEffect(() => {
    if (!userData) {
      const getUserDataQuery = async () => {
        await waitForToken();
        getUserData().catch(console.error);
      };
      getUserDataQuery().catch(console.error);
    }
  }, [userData]);

  const { t } = useTranslation();
  const userInfoFields = [
    { label: t('accountData.name'), value: userData ? userData.displayName : '...' },
    {
      label: t('accountData.email'),
      value: userData ? userData?.mail && userData?.mail.length > 0 && userData.mail.at(0) : '...',
    },
    { label: t('accountData.school'), value: userData ? userData.school : '...' },
    { label: t('accountData.role'), value: userData ? userData.sophomorixRole : '...' },
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
            className="mt-4"
            size="sm"
          >
            {t('accountData.change_password')}
          </Button>
        </div>

        <div className="mt-6">
          <h4 className="font-bold">{t('accountData.my_information')}</h4>
          {userData?.mail && userData?.mail.length > 1 && (
            <>
              <p>{t('accountData.mail_alias')}</p>
              {userData?.mail.slice(1).map((mail) => (
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
