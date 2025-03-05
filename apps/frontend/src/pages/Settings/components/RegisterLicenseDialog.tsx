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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/shared/Button';
import FormField from '@/components/shared/FormField';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { Form } from '@/components/ui/Form';
import useCommunityLicenseStore from '@/pages/UserSettings/Info/useCommunityLicenseStore';

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
        <div className="flex justify-end gap-2">
          <Button
            variant="btn-outline"
            size="lg"
            type="button"
            className="w-24 border-2"
            onClick={() => setIsRegisterDialogOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="btn-collaboration"
            size="lg"
            type="submit"
            className="w-24"
          >
            {t('settings.license.register')}
          </Button>
        </div>
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
        handleOpenChange={() => setIsRegisterDialogOpen(false)}
      />
    </>
  );
};

export default RegisterLicenseDialog;
