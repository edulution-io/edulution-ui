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

import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { HiTrash } from 'react-icons/hi';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';
import slugify from '@libs/common/utils/slugify';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Button } from '@/components/shared/Button';
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

  const newAppName = form.watch('customAppName');
  const slugifiedAppName = slugify(newAppName);

  const onSubmit = async () => {
    const newAppIcon = form.getValues('customIcon');
    const getAppType = () => {
      switch (selectedApp.id) {
        case APPS.FORWARDING:
          return APP_INTEGRATION_VARIANT.FORWARDED;
        case APPS.FRAME:
          return APP_INTEGRATION_VARIANT.FRAMED;
        case APPS.EMBEDDED:
          return APP_INTEGRATION_VARIANT.EMBEDDED;
        default:
          return APP_INTEGRATION_VARIANT.FORWARDED;
      }
    };

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
      if (selectedApp.id === APPS.EMBEDDED) {
        return { EMBEDDED_PAGE_HTML_CONTENT: '', EMBEDDED_PAGE_HTML_MODE: false };
      }
      return {};
    };

    const newConfig: AppConfigDto = {
      name: slugifiedAppName,
      translations: {
        de: newAppName,
        en: newAppName,
      },
      icon: newAppIcon,
      appType: getAppType(),
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const svgDataUrl = reader.result as string;
          form.setValue('customIcon', svgDataUrl, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp'],
    },
  });
  const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-lg ${
    isDragActive ? 'bg-foreground' : 'bg-popover-foreground'
  }`;

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
          <SelectIconField form={form} />
          <div>
            <p className="mb-1 font-bold">{t('appstore.uploadIcon')}</p>
            <div {...getRootProps({ className: dropzoneStyle })}>
              <input {...getInputProps()} />
              <div className="flex min-h-48 flex-col items-center justify-center space-y-2">
                <p className="text-wrap text-center font-semibold text-secondary">
                  {isDragActive ? t('filesharingUpload.dropHere') : t('appstore.dropIconDescription')}
                </p>
                <MdOutlineCloudUpload className="h-12 w-12 text-muted" />
              </div>
            </div>
            {form.getValues('customIcon') && (
              <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
                <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <li className="group relative overflow-hidden rounded-xl border border-accent p-2 shadow-lg transition-all duration-200 hover:min-h-[80px] hover:overflow-visible">
                    <img
                      src={form.getValues('customIcon')}
                      alt={t('filesharingUpload.previewAlt')}
                      className="mb-2 aspect-square h-auto w-full object-cover"
                      onLoad={() => {}}
                    />
                    <Button
                      onClick={() => form.setValue('customIcon', '')}
                      className="absolute right-1 top-1 h-8 rounded-full bg-ciRed bg-opacity-70 p-2 hover:bg-ciRed"
                    >
                      <HiTrash className="text-text-ciRed h-4 w-4" />
                    </Button>
                  </li>
                </ul>
              </ScrollArea>
            )}
          </div>
        </form>
      </Form>
    );
  };

  const handleClose = () => {
    form.reset();
    setIsAddAppConfigDialogOpen(false);
  };

  const getFooter = () => (
    <form>
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={form.handleSubmit(onSubmit)}
        submitButtonText="common.add"
        disableSubmit={isLoading}
      />
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isAddAppConfigDialogOpen}
      handleOpenChange={handleClose}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default AddAppConfigDialog;
