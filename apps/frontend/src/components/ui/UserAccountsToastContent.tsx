/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
