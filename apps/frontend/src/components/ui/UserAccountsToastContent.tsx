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
import type UserAccountDto from '@libs/user/types/userAccount.dto';
import { useTranslation } from 'react-i18next';
import { MdFileCopy } from 'react-icons/md';
import copyToClipboard from '@/utils/copyToClipboard';
import cn from '@libs/common/utils/className';
import { IoChevronDown } from 'react-icons/io5';
import PasswordCell from '@/pages/UserSettings/Security/components/PasswordCell';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';

interface UserAccountsToastContentProps {
  userAccounts: UserAccountDto[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const UserAccountsToastContent: React.FC<UserAccountsToastContentProps> = ({
  userAccounts,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex flex-row justify-center hover:underline"
      >
        <p className="mb-2">{t('usersettings.security.accountData')}</p>
        <IoChevronDown
          className={cn(isCollapsed ? '' : 'rotate-180', 'm-1 h-4 w-4 transition-transform duration-300')}
        />
      </button>
      <div className={cn('flex flex-col justify-center space-y-4 overflow-hidden', isCollapsed ? 'max-h-0' : '')}>
        {userAccounts.map((userAccount) => (
          <div
            key={userAccount.accountId}
            className="m-1 flex flex-col gap-2"
          >
            <InputWithActionIcons
              type="text"
              value={userAccount.accountUser}
              readOnly
              className="cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                copyToClipboard(userAccount.accountUser);
              }}
              actionIcons={[
                {
                  icon: MdFileCopy,
                  onClick: () => copyToClipboard(userAccount.accountUser),
                },
              ]}
            />
            <PasswordCell
              accountPassword={userAccount.accountPassword}
              isInput
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default UserAccountsToastContent;
