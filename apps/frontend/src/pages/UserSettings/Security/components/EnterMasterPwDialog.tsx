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
import { UseFormReturn } from 'react-hook-form';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import TotpInput from '@/pages/LoginPage/components/TotpInput';

interface EnterMasterPwDialogProps {
  isOpen: string;
  form: UseFormReturn<{ safePin: string }>;
  handleClose: () => void;
  handleConfirm: () => void;
}

const EnterMasterPwDialog: FC<EnterMasterPwDialogProps> = ({ isOpen, form, handleClose, handleConfirm }) => {
  const { t } = useTranslation();

  const getDialogBody = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleConfirm)}>
        <FormFieldSH
          control={form.control}
          name="safePin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TotpInput
                  totp={field.value}
                  maxLength={5}
                  title={t('usersettings.security.safePin')}
                  setTotp={field.onChange}
                  onComplete={() => form.handleSubmit(handleConfirm)}
                  type="pin"
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  const getDialogFooter = () => (
    <form onSubmit={form.handleSubmit(handleConfirm)}>
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={() => {}}
        submitButtonType="submit"
        submitButtonText="common.confirm"
      />
    </form>
  );

  return (
    <AdaptiveDialog
      title={t('usersettings.security.enterSafePin')}
      isOpen={isOpen === 'show' || isOpen === 'copy'}
      body={getDialogBody()}
      footer={getDialogFooter()}
      handleOpenChange={handleClose}
    />
  );
};

export default EnterMasterPwDialog;
