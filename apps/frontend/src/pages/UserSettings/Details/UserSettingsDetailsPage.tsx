import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDetailsSettingsIcon } from '@/assets/icons';
import useLmnApiStore from '@/store/useLmnApiStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import UserSettingsDetailsForm from '@/pages/UserSettings/Details/UserSettingsDetailsForm';
import Quota from '@/pages/Dashboard/Quota';
import Separator from '@/components/ui/Separator';
import Field from '@/components/shared/Field';
import Label from '@/components/ui/Label';
import BadgeField from '@/components/shared/BadgeField';

const UserSettingsDetailsPage: React.FC = () => {
  const { t } = useTranslation();

  const { user } = useLmnApiStore();

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

  return (
    <div className="bottom-[32px] left-4 right-[0px] top-3 h-screen md:left-[256px] md:right-[--sidebar-width]">
      <NativeAppHeader
        title={user?.displayName || t('common.not-available')}
        description={t('usersettings.details.description')}
        iconSrc={UserDetailsSettingsIcon}
      />
      <div className="p-4">
        <div className="md:max-w-[75%]">
          <h3>{t('usersettings.details.userInformation')}</h3>
          <div className="py-4 text-ciGrey">
            {userInfo.map((field) => (
              <Field
                key={`userInfoField-${field.name}`}
                value={field.value}
                labelTranslationId={field.label}
                variant="lightGrayDisabled"
                className="mb-4 mt-2"
              />
            ))}

            <Label>
              <p className="font-bold">{t('usersettings.details.schoolSubjects')}</p>
            </Label>
            <BadgeField
              value={user?.schoolclasses || []}
              readOnly
              className="mt-2"
            />
          </div>
        </div>
        <Separator className="my-4 bg-ciGrey" />

        <h3>{t('usersettings.details.title')}</h3>
        <div className="mb-4 space-y-4 py-4">
          <UserSettingsDetailsForm />
        </div>

        <Separator className="my-4 bg-ciGrey" />

        <div className="md:max-w-[75%]">
          <h3>{t('usersettings.details.quotas')}</h3>
          <div className="space-y-4 py-4 text-ciGrey">
            <Quota />
          </div>

          <div className="h-[50px]" />
        </div>
      </div>
    </div>
  );
};

export default UserSettingsDetailsPage;
