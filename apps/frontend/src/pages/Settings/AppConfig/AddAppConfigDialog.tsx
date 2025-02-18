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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import CircleLoader from '@/components/ui/CircleLoader';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';
import slugify from '@libs/common/utils/slugify';
import getCustomAppConfigFormSchema from './schemas/getCustomAppConfigFormSchema';
import SelectIconField from './components/SelectIconField';

interface AddAppConfigDialogProps {
  selectedApp: AppConfigOption;
}

const AddAppConfigDialog: React.FC<AddAppConfigDialogProps> = ({ selectedApp }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAddAppConfigDialogOpen, appConfigs, setIsAddAppConfigDialogOpen, createAppConfig, isLoading, error } =
    useAppConfigsStore();

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(getCustomAppConfigFormSchema(t, appConfigs)),
    defaultValues: {
      customAppName: '',
      customIcon: '',
    },
  });

  const onSubmit = async () => {
    const newAppName = form.getValues('customAppName');
    const newAppIcon = form.getValues('customIcon');
    const getAppType = () => {
      switch (selectedApp.id) {
        case APPS.FORWARDING:
          return APP_INTEGRATION_VARIANT.FORWARDED;
        case APPS.EMBEDDED:
          return APP_INTEGRATION_VARIANT.EMBEDDED;
        case APPS.FRAME:
          return APP_INTEGRATION_VARIANT.EMBEDDED;
        default:
          return APP_INTEGRATION_VARIANT.FORWARDED;
      }
    };

    const newConfig: AppConfigDto = {
      name: slugify(newAppName),
      translations: {
        de: newAppName,
      },
      icon: newAppIcon,
      appType: getAppType(),
      options: {
        url: '',
        proxyConfig: '""',
      },
      accessGroups: [],
      extendedOptions: {},
    };

    await createAppConfig(newConfig);
    if (!error) {
      setIsAddAppConfigDialogOpen(false);
      navigate(`/${SETTINGS_PATH}/${newAppName}`);
    }
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <Form {...form}>
        <form
          className="mt-4 space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name="customAppName"
            defaultValue=""
            form={form}
            labelTranslationId={t('common.name')}
            variant="dialog"
          />
          <SelectIconField form={form} />
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
