/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { USER_SETTINGS_USER_DETAILS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import Avatar from '@/components/shared/Avatar';
import useLogout from '@/hooks/useLogout';
import DropdownMenu from '@/components/shared/DropdownMenu';
import useUserStore from '@/store/UserStore/useUserStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import cn from '@libs/common/utils/className';

const UserMenuButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const handleLogout = useLogout({ isForceLogout: true });
  const { user } = useUserStore();
  const { user: lmnApiUser } = useLmnApiStore();
  const thumbnailPhoto = lmnApiUser?.thumbnailPhoto || '';
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);

  const userMenuClassName = isEdulutionApp ? '' : 'lg:min-w-[var(--sidebar-width)]';
  const dropdownWrapperClassName = isEdulutionApp ? '' : 'lg:block lg:px-3';
  const nameClassName = isEdulutionApp ? '' : 'lg:hidden';

  const handleUserSettingsClick = () => {
    navigate(USER_SETTINGS_USER_DETAILS_PATH);
  };

  return (
    <div
      key="usermenu"
      className={cn('min-w-[260px] bg-foreground dark:bg-black', userMenuClassName)}
    >
      <div
        className={cn(
          'flex max-h-14 cursor-pointer items-center justify-end gap-4 px-4 py-2',
          dropdownWrapperClassName,
        )}
      >
        <DropdownMenu
          menuContentClassName="z-[600]"
          trigger={
            <div className="group flex items-center gap-4">
              <p className={cn('text-md font-bold', nameClassName)}>
                {auth?.user?.profile?.given_name ?? ''} {auth?.user?.profile?.family_name ?? ''}
              </p>
              <Avatar
                user={{ username: user?.username || '', firstName: user?.firstName, lastName: user?.lastName }}
                imageSrc={thumbnailPhoto}
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
