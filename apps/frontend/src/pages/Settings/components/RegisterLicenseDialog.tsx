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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/shared/FormField';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { Form } from '@/components/ui/Form';
import useCommunityLicenseStore from '@/pages/UserSettings/Info/useCommunityLicenseStore';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const RegisterLicenseDialog: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, isRegisterDialogOpen, signLicense, setIsRegisterDialogOpen } = useCommunityLicenseStore();

  const form = useForm({
    mode: 'onSubmit',
    defaultValues: {
      licenseKey: '',
    },
    resolver: zodResolver(
      z.object({
        licenseKey: z.string().min(1, { message: t('common.required') }),
      }),
    ),
  });

  useEffect(() => {
    if (isRegisterDialogOpen) {
      form.reset();
    }
  }, [isRegisterDialogOpen]);

  const onSubmit = async () => {
    await signLicense(form.getValues('licenseKey'));
  };

  const handleClose = () => setIsRegisterDialogOpen(false);

  const getDialogBody = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          name="licenseKey"
          form={form}
          labelTranslationId={t('settings.license.licenseKey')}
          variant="dialog"
          description={t('settings.license.licenseKeyDescription')}
        />
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={() => {}}
          submitButtonText="settings.license.register"
          submitButtonType="submit"
        />
      </form>
    </Form>
  );

  return (
    <>
      <div className="absolute right-10 top-12 md:right-20 md:top-10">{isLoading ? <CircleLoader /> : null}</div>
      <AdaptiveDialog
        title={t('settings.license.registerLicense')}
        isOpen={isRegisterDialogOpen}
        body={getDialogBody()}
        handleOpenChange={handleClose}
      />
    </>
  );
};

export default RegisterLicenseDialog;
