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

const EnterSafePinDialog: FC<EnterMasterPwDialogProps> = ({ isOpen, form, handleClose, handleConfirm }) => {
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
                  onComplete={form.handleSubmit(handleConfirm)}
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

export default EnterSafePinDialog;
