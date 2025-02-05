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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import getDialogBodySetup from '@/pages/FileSharing/dialog/DialogBodys/dialogBodyConfigurations';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { FileSharingFormValues } from '@libs/filesharing/types/filesharingDialogProps';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FileActionType from '@libs/filesharing/types/fileActionType';
import CircleLoader from '@/components/ui/CircleLoader';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import DocumentVendors from '@libs/filesharing/constants/documentVendors';
import getFileSharingFormSchema from '../formSchema';

interface CreateContentDialogProps {
  trigger?: React.ReactNode;
}

const ActionContentDialog: React.FC<CreateContentDialogProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const {
    isDialogOpen,
    closeDialog,
    moveOrCopyItemToPath,
    openDialog,
    isLoading,
    error,
    action,
    handleItemAction,
    selectedFileType,
    filesToUpload,
    setSelectedFileType,
    setMoveOrCopyItemToPath,
    setFilesToUpload,
    isSubmitButtonInActive,
    setSubmitButtonIsInActive,
  } = useFileSharingDialogStore();
  const { currentPath, selectedItems } = useFileSharingStore();
  const { appConfigs } = useAppConfigsStore();

  const { Component, schema, titleKey, submitKey, initialValues, endpoint, httpMethod, type, getData } =
    getDialogBodySetup(action);

  const form = useForm<FileSharingFormValues>({
    resolver: schema ? zodResolver(getFileSharingFormSchema(t)) : undefined,
    mode: 'onChange',
    defaultValues: initialValues || {},
  });

  const clearAllSelectedItems = () => {
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setSelectedFileType('');
    setFilesToUpload([]);
  };

  const onSubmit = async () => {
    const isOpenDocumentFormatEnabled = !!getExtendedOptionValue(
      appConfigs,
      APPS.FILE_SHARING,
      ExtendedOptionKeys.OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO,
    );
    const documentVendor = isOpenDocumentFormatEnabled ? DocumentVendors.ODF : DocumentVendors.MSO;

    const data = await getData(form, currentPath, {
      selectedItems,
      moveOrCopyItemToPath,
      selectedFileType,
      filesToUpload,
      documentVendor,
    });

    if (Array.isArray(data) && data.some((item) => 'file' in item && item.file instanceof File)) {
      const uploadPromises = data.map((item) => {
        if ('file' in item && item.file instanceof File) {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('path', item.path);
          formData.append('name', item.name);
          formData.append('currentPath', currentPath);
          return handleItemAction(action, endpoint, httpMethod, type, formData);
        }
        return Promise.resolve();
      });

      await Promise.all(uploadPromises);
    } else {
      setSubmitButtonIsInActive(false);
      await handleItemAction(action, endpoint, httpMethod, type, data);
    }

    clearAllSelectedItems();
    form.reset();
  };

  const handelOpenChange = () => {
    if (isDialogOpen) {
      closeDialog();
      setSubmitButtonIsInActive(false);
      form.reset();
    } else {
      openDialog(action);
    }
  };

  const title = action === FileActionType.CREATE_FILE ? t(`fileCreateNewContent.${selectedFileType}`) : t(titleKey);
  const handleFormSubmit = form.handleSubmit(onSubmit);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      void handleFormSubmit();
    }
  };

  return (
    <AdaptiveDialog
      isOpen={isDialogOpen}
      handleOpenChange={handelOpenChange}
      trigger={trigger}
      title={t(title)}
      body={
        <div
          role="presentation"
          onKeyDown={handleDialogKeyDown}
        >
          {isLoading && <CircleLoader className="mx-auto mt-5" />}
          <Component
            form={form}
            isRenaming
          />
        </div>
      }
      footer={
        error ? (
          <div className="rounded-xl bg-ciLightRed py-3 text-center text-background">{error.message}</div>
        ) : (
          <div className="mt-4 flex justify-end">
            <form onSubmit={handleFormSubmit}>
              <Button
                variant="btn-collaboration"
                disabled={isLoading || isSubmitButtonInActive}
                size="lg"
                type="submit"
                onClick={handleFormSubmit}
              >
                {t(submitKey)}
              </Button>
            </form>
          </div>
        )
      }
    />
  );
};

export default ActionContentDialog;
