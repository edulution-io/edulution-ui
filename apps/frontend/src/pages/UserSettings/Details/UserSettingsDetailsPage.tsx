import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SOPHOMORIX_TEACHER } from '@libs/lmnApi/constants/sophomorixRoles';
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
      { name: 'name', label: t('usersettings.details.name'), value: user?.name || '...' },
      { name: 'displayName', label: t('usersettings.details.displayName'), value: user?.displayName || '...' },
      { name: 'dateOfBirth', label: t('usersettings.details.dateOfBirth'), value: user?.sophomorixBirthdate || '...' },
      { name: 'email', label: t('accountData.email'), value: user?.mail?.[0] || '...' },
      { name: 'schoolName', label: t('usersettings.details.schoolName'), value: user?.school || '...' },
      { name: 'role', label: t('usersettings.details.role'), value: t(user?.sophomorixRole || '...') },
    ],
    [user, t],
  );

  // TODO: NIEDUUI-417: Make this dynamic using the user object
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
    return [];
  }, [user, t]);

  // TODO: NIEDUUI-417: Make this dynamic using the user object
  const userDataMulti = useMemo(() => {
    if (user?.sophomorixRole === SOPHOMORIX_TEACHER) {
      return [
        {
          type: 'badges',
          name: 'sophomorixCustomMulti1',
          label: t('usersettings.details.sophomorixCustomMulti1_teacher'),
          value: user?.sophomorixCustomMulti1 || [],
        },
      ];
    }
    return [];
  }, [user, t]);

  return (
    <div className="bottom-[32px] left-4 right-[0px] top-3 h-screen md:left-[256px] md:right-[--sidebar-width]">
      <NativeAppHeader
        title={user?.displayName || '...'}
        description=""
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
              onChange={() => {}}
              readOnly
              className="mt-2"
            />
          </div>
        </div>
        <Separator className="my-4 bg-ciGrey" />

        <h3>{t('usersettings.details.title')}</h3>
        <div className="mb-4 space-y-4 py-4">
          <UserSettingsDetailsForm
            userDataFields={userData}
            userDataMultiFields={userDataMulti}
          />
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
