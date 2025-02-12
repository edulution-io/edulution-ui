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
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { useNavigate } from 'react-router-dom';
import CircleLoader from '@/components/ui/CircleLoader';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { SettingsIcon } from '@/assets/icons';
import getCustomAppConfigFormSchema from './schemas/getCustomAppConfigFormSchema';

const AddAppConfigDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen, createAppConfig, isLoading, error } =
    useAppConfigsStore();

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(getCustomAppConfigFormSchema(t)),
    defaultValues: {
      customAppName: '',
    },
  });

  const onSubmit = async () => {
    const newConfig: AppConfigDto = {
      name: form.getValues('customAppName'),
      icon: SettingsIcon,
      appType: APP_INTEGRATION_VARIANT.FORWARDED,
      options: {},
      accessGroups: [],
      extendedOptions: {},
    };

    await createAppConfig(newConfig);
    if (!error) {
      setIsAddAppConfigDialogOpen(false);
      navigate(`/${SETTINGS_PATH}/${form.getValues('customAppName')}`);
    }
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <Form {...form}>
        <form
          className="mt-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name="customAppName"
            defaultValue=""
            form={form}
            labelTranslationId={t('common.name')}
            variant="dialog"
            className=""
          />
          <div className="mt-12 flex justify-end">
            <Button
              type="submit"
              variant="btn-collaboration"
              size="lg"
              disabled={isLoading}
            >
              {t('common.add')}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isAddAppConfigDialogOpen}
      handleOpenChange={() => setIsAddAppConfigDialogOpen(false)}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
    />
  );
};

export default AddAppConfigDialog;
