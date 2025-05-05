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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { decryptPassword } from '@libs/common/utils/encryptPassword';
import copyToClipboard from '@/utils/copyToClipboard';
import Input from '@/components/shared/Input';
import cn from '@libs/common/utils/className';
import { decodeBase64 } from '@libs/common/utils/getBase64String';
import type EncryptedPasswordObject from '@libs/common/types/encryptPasswordObject';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EnterSafePinDialog from './EnterSafePinDialog';

interface PasswordCellProps {
  accountPassword: string;
  isInput?: boolean;
}

const PasswordCell: React.FC<PasswordCellProps> = ({ accountPassword, isInput = false }) => {
  const { t } = useTranslation();
  const placeholder = '********';
  const [password, setPassword] = useState(placeholder);
  const isVisible = password !== placeholder;

  const [isOpen, setIsOpen] = useState('');

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(z.object({ safePin: z.string().min(5, { message: t('common.required') }) })),
    defaultValues: {
      safePin: '',
    },
  });

  const safePin = form.watch('safePin');

  const handleDecryptPassword = async () => {
    const encryptedPassword = await decryptPassword(
      JSON.parse(decodeBase64(accountPassword)) as EncryptedPasswordObject,
      safePin,
    );

    if (encryptedPassword) {
      return encryptedPassword;
    }
    form.setValue('safePin', '');
    toast.error(t('usersettings.security.wrongSafePin'));
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
    if (isOpen === 'show' || safePin) {
      await handleDecrypt();
    } else if (password === placeholder) {
      setIsOpen('show');
    } else {
      setIsOpen('');
    }
  };

  const handleCopyPassword = async () => {
    if (isOpen === 'copy' || safePin) {
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

  const handleConfirm = async () => {
    if (isOpen === 'show') {
      await handleShowPassword();
    }
    if (isOpen === 'copy') {
      await handleCopyPassword();
    }

    setIsOpen('');
  };

  const handleClose = () => {
    setIsOpen('');
    form.setValue('safePin', '');
  };

  const getCopyButton = () => (
    <button
      type="button"
      onClickCapture={() => handleCopyPassword()}
    >
      <MdFileCopy />
    </button>
  );

  return (
    <>
      <div className={cn('flex flex-row items-center gap-4', { 'justify-between': !isInput })}>
        {isInput ? (
          <Input
            title={t('common.username')}
            type="text"
            value={isVisible ? password : placeholder}
            readOnly
            className="min-w-64 cursor-pointer"
            onMouseDown={(e) => {
              e.preventDefault();
              void handleCopyPassword();
            }}
            icon={getCopyButton()}
          />
        ) : (
          <SelectableTextCell
            onClick={() => handleCopyPassword()}
            text={isVisible ? password : placeholder}
            className="min-w-28 cursor-pointer"
          />
        )}
        <div className={cn('flex flex-row items-center gap-2', { 'mr-10': !isInput })}>
          {!isInput && getCopyButton()}
          <button
            type="button"
            onClick={() => handleShowPassword()}
          >
            <img
              src={isVisible ? EyeLightIcon : EyeLightSlashIcon}
              alt="eye"
              className="h-6 min-h-6 w-6 min-w-6"
            />
          </button>
        </div>
      </div>
      <EnterSafePinDialog
        isOpen={isOpen}
        form={form}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </>
  );
};

export default PasswordCell;
