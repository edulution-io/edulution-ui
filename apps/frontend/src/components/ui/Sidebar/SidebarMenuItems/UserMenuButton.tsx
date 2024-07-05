import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import USER_SETTINGS from '@libs/userSettings/types/user-settings-endpoints';
import cleanAllStores from '@/store/utilis/cleanAllStores';
import useUserStore from '@/store/UserStore/UserStore';
import Avatar from '@/components/shared/Avatar';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';
import useIsMobileView from '@/hooks/useIsMobileView';

const UserMenuButton: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const navigate = useNavigate();
  const auth = useAuth();
  const { logout } = useUserStore();

  const handleUserSettingsClick = () => {
    navigate(USER_SETTINGS);
  };

  const handleLogout = async () => {
    auth.removeUser().catch(console.error);
    await logout();
    cleanAllStores();
  };

  return (
    <div
      key="usermenu"
      className={`${isMobileView ? 'border-b-2' : 'fixed bottom-0 right-0 border-t-2 bg-black'}`}
    >
      <div className="flex h-[58px] cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-2">
        <DropdownMenuSH>
          <DropdownMenuTrigger className="group flex items-center gap-4">
            <p className="text-md font-bold md:hidden">
              {auth?.user?.profile?.given_name ?? ''} {auth?.user?.profile?.family_name ?? ''}
            </p>
            <Avatar />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="z-50"
          >
            <DropdownMenuItem onClick={handleUserSettingsClick}>{t('usersettings.sidebar')} </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>{t('common.logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuSH>
      </div>
    </div>
  );
};

export default UserMenuButton;
