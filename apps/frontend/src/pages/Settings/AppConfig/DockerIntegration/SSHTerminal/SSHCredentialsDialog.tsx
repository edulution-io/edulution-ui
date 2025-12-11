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
import { useForm } from 'react-hook-form';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';
import useSSHTerminalStore from './useSSHTerminalStore';

type SSHCredentialsFormValues = {
  username: string;
  password: string;
};

const SSHCredentialsDialog: React.FC = () => {
  const { t } = useTranslation();
  const { isCredentialsDialogOpen, isLoading, setIsCredentialsDialogOpen, openTerminal } = useSSHTerminalStore();

  const form = useForm<SSHCredentialsFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleClose = () => {
    setIsCredentialsDialogOpen(false);
    form.reset();
  };

  const onSubmit = async (data: SSHCredentialsFormValues) => {
    await openTerminal({
      username: data.username,
      password: data.password,
    });
  };

  const getDialogBody = () => (
    <Form {...form}>
      <form
        id="ssh-credentials-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
          <FormField
            labelTranslationId={t('common.username')}
            name="username"
            form={form}
            variant="dialog"
          />
          <FormField
            labelTranslationId={t('common.password')}
            name="password"
            form={form}
            variant="dialog"
            type="password"
          />
        </div>
      </form>
    </Form>
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      cancelButtonText="common.cancel"
      handleSubmit={form.handleSubmit(onSubmit)}
      submitButtonText="ssh-terminal.connect"
      disableSubmit={isLoading}
    />
  );

  return (
    <AdaptiveDialog
      body={getDialogBody()}
      footer={getFooter()}
      isOpen={isCredentialsDialogOpen}
      handleOpenChange={handleClose}
      title={t('ssh-terminal.credentials')}
    />
  );
};

export default SSHCredentialsDialog;
