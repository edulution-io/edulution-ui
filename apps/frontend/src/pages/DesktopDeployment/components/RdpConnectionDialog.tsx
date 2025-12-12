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
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';

type RdpConnectionForm = {
  host: string;
};

type RdpConnectionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (host: string) => void;
};

const RdpConnectionDialog: React.FC<RdpConnectionDialogProps> = ({ isOpen, onClose, onConnect }) => {
  const { t } = useTranslation();

  const formSchema = z.object({
    host: z.string().min(1, { message: t('common.required') }),
  });

  const form = useForm<RdpConnectionForm>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: '',
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = () => {
    const { host } = form.getValues();
    onConnect(host);
    handleClose();
  };

  const dialogBody = (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <FormField
          name="host"
          form={form}
          labelTranslationId="desktopdeployment.rdpDialog.host"
          variant="dialog"
        />
      </div>
    </Form>
  );

  const dialogFooter = (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={form.handleSubmit(handleSubmit)}
      submitButtonText="desktopdeployment.connect"
      disableSubmit={!form.formState.isValid}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t('desktopdeployment.rdpDialog.title')}
      body={dialogBody}
      footer={dialogFooter}
    />
  );
};

export default RdpConnectionDialog;
