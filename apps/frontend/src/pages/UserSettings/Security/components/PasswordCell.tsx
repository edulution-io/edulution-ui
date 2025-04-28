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

import React, { useState } from 'react';
import { MdFileCopy } from 'react-icons/md';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { decryptPassword } from '@libs/common/utils/encryptPassword';
import EncryptedPasswordObject from '@libs/common/types/encryptPasswordObject';
import copyToClipboard from '@/utils/copyToClipboard';
import Input from '@/components/shared/Input';
import cn from '@libs/common/utils/className';
import EnterMasterPwDialog from './EnterMasterPwDialog';

interface PasswordCellProps {
  accountPassword: string;
  isInput?: boolean;
}

const PasswordCell: React.FC<PasswordCellProps> = ({ accountPassword, isInput = false }) => {
  const { t } = useTranslation();
  const placeholder = '********';
  const [password, setPassword] = useState(placeholder);
  const isVisible = password !== '********';

  const [isOpen, setIsOpen] = useState('');
  const [masterPw, setMasterPassword] = useState('');

  const handleDecryptPassword = async () => {
    const encryptedPassword = await decryptPassword(JSON.parse(accountPassword) as EncryptedPasswordObject, masterPw);

    if (encryptedPassword) {
      return encryptedPassword;
    }
    setMasterPassword('');
    toast.error(t('usersettings.security.wrongMasterPassword'));
    return placeholder;
  };

  const handleDecrypt = async () => {
    if (password === placeholder) {
      const encryptedPassword = await handleDecryptPassword();

      if (encryptedPassword !== placeholder) {
        setPassword(encryptedPassword);
      }
    } else {
      setPassword(placeholder);
    }
  };

  const handleShowPassword = async () => {
    if (isOpen === 'show' || masterPw) {
      await handleDecrypt();
    } else if (password === placeholder) {
      setIsOpen('show');
    } else {
      setIsOpen('');
    }
  };

  const handleCopyPassword = async () => {
    if (isOpen === 'copy' || masterPw) {
      const encryptedPassword = await handleDecryptPassword();

      if (encryptedPassword !== placeholder) {
        copyToClipboard(encryptedPassword);
      }
    } else if (password === placeholder) {
      setIsOpen('copy');
    } else {
      setIsOpen('');
    }
  };

  const handleClose = async () => {
    if (isOpen === 'show') {
      await handleShowPassword();
    }
    if (isOpen === 'copy') {
      await handleCopyPassword();
    }

    setIsOpen('');
  };

  return (
    <>
      <div className="flex min-w-64 flex-row items-center justify-between gap-4">
        {isInput ? (
          <Input
            title={t('common.username')}
            type="text"
            value={isVisible ? password : placeholder}
            readOnly
            className="w-full cursor-pointer"
            onClick={() => handleCopyPassword()}
          />
        ) : (
          <SelectableTextCell
            onClick={() => handleCopyPassword()}
            text={isVisible ? password : placeholder}
          />
        )}
        <div className={cn('flex flex-row items-center gap-2', { 'mr-10': !isInput })}>
          <button
            type="button"
            onClick={() => handleShowPassword()}
          >
            <img
              src={isVisible ? EyeLightIcon : EyeLightSlashIcon}
              alt="eye"
              width="25px"
            />
          </button>
          <button
            type="button"
            onClick={() => handleCopyPassword()}
          >
            <MdFileCopy />
          </button>
        </div>
      </div>
      <EnterMasterPwDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        masterPw={masterPw}
        setMasterPassword={setMasterPassword}
        handleClose={handleClose}
      />
    </>
  );
};

export default PasswordCell;
