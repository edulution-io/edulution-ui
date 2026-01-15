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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';
import slugify from '@libs/common/utils/slugify';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import getCustomAppConfigFormSchema from './schemas/getCustomAppConfigFormSchema';
import AppConfigIconEditor from './components/AppConfigIconEditor';

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

  const newAppName = form.watch('customAppName');
  const slugifiedAppName = slugify(newAppName);

  const onSubmit = async () => {
    const newAppIcon = form.getValues('customIcon');

    const getOptions = () => {
      if (selectedApp.id === APPS.EMBEDDED) {
        return {
          proxyConfig: '""',
        };
      }
      return {
        url: '',
        proxyConfig: '""',
      };
    };

    const getExtendedOptions = () => {
      const defaults: Record<string, unknown> = {};

      if (selectedApp.extendedOptions) {
        Object.values(selectedApp.extendedOptions).forEach((sectionOptions) => {
          sectionOptions.forEach((option) => {
            if (option.value !== undefined) {
              defaults[option.name] = option.value;
            }
          });
        });
      }

      if (selectedApp.id === APPS.EMBEDDED) {
        defaults.EMBEDDED_PAGE_HTML_CONTENT = '';
        defaults.EMBEDDED_PAGE_HTML_MODE = false;
      }

      return defaults;
    };

    const newConfig: AppConfigDto = {
      name: slugifiedAppName,
      translations: {
        de: newAppName,
        en: newAppName,
        fr: newAppName,
      },
      icon: newAppIcon,
      appType: selectedApp.id as AppIntegrationType,
      options: getOptions(),
      accessGroups: [],
      extendedOptions: getExtendedOptions(),
      position: 0,
    };

    await createAppConfig(newConfig);
  };

  useEffect(() => {
    if (isAddAppConfigDialogOpen && !isLoading && !error) {
      setIsAddAppConfigDialogOpen(false);
      navigate(`/${SETTINGS_PATH}/${slugifiedAppName}`);
    }
  }, [isLoading, error]);

  const handleClose = () => {
    form.reset();
    setIsAddAppConfigDialogOpen(false);
  };

  const handleIconChange = (icon: string) => {
    form.setValue('customIcon', icon, { shouldValidate: true });
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
            form={form}
            labelTranslationId={t('common.name')}
            variant="dialog"
          />
          <AppConfigIconEditor
            currentIcon={form.watch('customIcon')}
            onIconChange={handleIconChange}
          />
          <DialogFooterButtons
            handleClose={handleClose}
            handleSubmit={() => {}}
            submitButtonText="common.add"
            submitButtonType="submit"
            disableSubmit={isLoading}
          />
        </form>
      </Form>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isAddAppConfigDialogOpen}
      handleOpenChange={handleClose}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
    />
  );
};

export default AddAppConfigDialog;
