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

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@/components/shared/Input';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface EnterMasterPwDialogProps {
  isOpen: string;
  setIsOpen: React.Dispatch<React.SetStateAction<string>>;
  masterPw: string;
  setMasterPassword: React.Dispatch<React.SetStateAction<string>>;
  handleClose: () => void;
}

const EnterMasterPwDialog: FC<EnterMasterPwDialogProps> = ({
  isOpen,
  setIsOpen,
  masterPw,
  setMasterPassword,
  handleClose,
}) => {
  const { t } = useTranslation();

  const getDialogBody = () => (
    <Input
      value={masterPw}
      onChange={(e) => setMasterPassword(e.target.value)}
      onKeyDown={(key) => (key.key === 'Enter' ? handleClose() : null)}
    />
  );

  const getDialogFooter = () => (
    <DialogFooterButtons
      handleClose={() => setIsOpen('')}
      handleSubmit={handleClose}
      submitButtonText="common.ok"
    />
  );

  return (
    <AdaptiveDialog
      title={t('usersettings.security.enterMasterPassword')}
      isOpen={isOpen === 'show' || isOpen === 'copy'}
      body={getDialogBody()}
      footer={getDialogFooter()}
      handleOpenChange={() => setIsOpen('')}
    />
  );
};

export default EnterMasterPwDialog;
