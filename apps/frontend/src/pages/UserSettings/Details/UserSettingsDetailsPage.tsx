import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SOPHOMORIX_TEACHER } from '@libs/lmnApi/constants/sophomorixRoles';
import { UserDetailsSettingsIcon } from '@/assets/icons';
import useLmnApiStore from '@/store/useLmnApiStore';
import UserInformation from '@/pages/UserSettings/Details/UserInformation';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import UserSettingsDetailsForm from '@/pages/UserSettings/Details/UserSettingsDetailsForm';
import QuotaBody from '@/pages/UserSettings/Details/QuotaBody';
import { BadgeSH } from '@/components/ui/BadgeSH';
import Separator from '@/components/ui/Separator';

const UserSettingsDetailsPage: React.FC = () => {
  const { t } = useTranslation();

  const { user } = useLmnApiStore();

  const userInfo = useMemo(
    () => [
      { label: t('usersettings.details.name'), value: user?.name || '...' },
      { label: t('usersettings.details.displayName'), value: user?.displayName || '...' },
      { label: t('usersettings.details.dateOfBirth'), value: user?.sophomorixBirthdate || '...' },
      { label: t('accountData.email'), value: (user?.mail && user.mail.length > 0 && user.mail.at(0)) || '...' },
      { label: t('usersettings.details.schoolName'), value: user?.school || '...' },
      { label: t('usersettings.details.role'), value: t(user?.sophomorixRole || '...') },
    ],
    [user],
  );

  const userData = useMemo(() => {
    if (user?.sophomorixRole === SOPHOMORIX_TEACHER) {
      return [
        {
          type: 'text',
          name: 'sophomorixCustom1',
          label: t('usersettings.details.sophomorixCustom1_teacher'),
          value: user?.sophomorixCustom1 || '...',
        },
        {
          type: 'text',
          name: 'sophomorixCustom2',
          label: t('usersettings.details.sophomorixCustom2_teacher'),
          value: user?.sophomorixCustom2 || '...',
        },
      ];
    }
    return undefined;
  }, [user]);

  return (
    <div className="bottom-8 left-4 right-0 top-3 h-screen md:left-64 md:right-[--sidebar-width]">
      <div className="flex flex-row justify-between">
        <NativeAppHeader
          title={user?.displayName || '...'}
          description=""
          iconSrc={UserDetailsSettingsIcon}
        />
      </div>

      <div className="md:max-w-[75%]">
        <h3>{t('usersettings.details.userInformation')}</h3>
        <div className="mb-4 space-y-4 py-4 text-ciGrey">
          <UserInformation userInfoFields={userInfo} />

          <div>
            <p>{t('usersettings.details.schoolSubjects')}:</p>
            <div className="flex flex-row flex-wrap gap-2">
              {user?.schoolclasses.map((subject) => (
                <BadgeSH
                  key={`badge-${subject}`}
                  className="color-white cursor-not-allowed text-background"
                >
                  {t(subject)}
                </BadgeSH>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-4 bg-ciGrey" />

      <h3>{t('usersettings.details.title')}</h3>
      <div className="mb-4 space-y-4 py-4">
        <UserSettingsDetailsForm userDataFields={userData || []} />
      </div>

      <Separator className="my-4 bg-ciGrey" />

      <div className="md:max-w-[75%]">
        <h3>{t('usersettings.details.quotas')}</h3>
        <div className="space-y-4 py-4 text-ciGrey">
          <QuotaBody />
        </div>

        <div className="h-[50px]" />
      </div>
    </div>
  );
};

export default UserSettingsDetailsPage;
