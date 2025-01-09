import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { USER_SETTINGS_SECURITY_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import Avatar from '@/components/shared/Avatar';
import useLogout from '@/hooks/useLogout';
import DropdownMenu from '@/components/shared/DropdownMenu';
import useUserStore from '@/store/UserStore/UserStore';
import useLmnApiStore from '@/store/useLmnApiStore';

const UserMenuButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const handleLogout = useLogout();
  const { user } = useUserStore();
  const { user: lmnApiUser } = useLmnApiStore();
  const thumbnailPhoto = lmnApiUser?.thumbnailPhoto || '';

  const handleUserSettingsClick = () => {
    navigate(USER_SETTINGS_SECURITY_PATH);
  };

  return (
    <div
      key="usermenu"
      className="fixed bottom-0 right-0 bg-black"
    >
      <div className="flex h-[58px] cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-2">
        <DropdownMenu
          trigger={
            <div className="group flex items-center gap-4">
              <p className="text-md font-bold md:hidden">
                {auth?.user?.profile?.given_name ?? ''} {auth?.user?.profile?.family_name ?? ''}
              </p>
              <Avatar
                user={{ username: user?.username || '', firstName: user?.firstName, lastName: user?.lastName }}
                imageSrc={thumbnailPhoto}
                className={thumbnailPhoto && 'p-1'}
              />
            </div>
          }
          items={[
            { label: t('usersettings.sidebar'), onClick: handleUserSettingsClick },
            { label: 'logoutSeparator', isSeparator: true },
            {
              label: t('common.logout'),
              onClick: () => {
                void handleLogout();
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default UserMenuButton;
