import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'usehooks-ts';
import cleanAllStores from '@/store/utilis/cleanAllStores';
import { useAuth } from 'react-oidc-context';
import useUserStore from '@/store/userStore';
import Avatar from '@/components/shared/Avatar';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';

const UserMenuButton: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const auth = useAuth();
  const { logout } = useUserStore();

  const handleUserSettingsClick = () => {
    navigate('user');
  };

  const handleLogout = async () => {
    auth.removeUser().catch(console.error);
    await logout();
    cleanAllStores();
  };

  return (
    <div
      key="logout"
      className={`${isDesktop ? 'fixed bottom-0 right-0 border-t-2 bg-black' : 'border-b-2 '}`}
    >
      <div className="flex h-[58px] cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-2">
        <DropdownMenuSH>
          <DropdownMenuTrigger className="group flex items-center gap-4">
            <p className="text-md font-bold md:hidden">{t('user')}</p>
            <Avatar />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
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