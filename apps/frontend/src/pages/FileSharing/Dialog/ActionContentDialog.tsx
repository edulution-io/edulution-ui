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
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import getDialogBodySetup from '@/pages/FileSharing/Dialog/DialogBodys/dialogBodyConfigurations';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { FileSharingFormValues } from '@libs/filesharing/types/filesharingDialogProps';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FileActionType from '@libs/filesharing/types/fileActionType';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import getDocumentVendor from '@libs/filesharing/utils/getDocumentVendor';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
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
    setSubmitButtonIsInActive(false);
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setSelectedFileType('');
    setFilesToUpload([]);
    closeDialog();
    form.reset();
  };

  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const onSubmit = async () => {
    const documentVendor = getDocumentVendor(appConfigs);

    const data = await getData(form, currentPath, {
      selectedItems,
      moveOrCopyItemToPath,
      selectedFileType,
      filesToUpload,
      documentVendor,
    });

    if (Array.isArray(data) && data.some((item) => 'file' in item && item.file instanceof File)) {
      const chunkedData = chunkArray<FileUploadProps>(data as FileUploadProps[], 5);

      await chunkedData.reduce<Promise<void>>(async (promiseChain, chunk) => {
        await promiseChain;
        await Promise.all(
          chunk.map((item) => {
            if ('file' in item && item.file instanceof File) {
              const formData = new FormData();
              formData.append('file', item.file);
              formData.append('path', item.path);
              formData.append('name', item.name);
              formData.append('currentPath', currentPath);
              return handleItemAction(action, endpoint, httpMethod, type, formData);
            }
            return Promise.resolve();
          }),
        );
      }, Promise.resolve());
    } else {
      setSubmitButtonIsInActive(false);
      await handleItemAction(action, endpoint, httpMethod, type, data);
    }

    clearAllSelectedItems();
  };

  const handelOpenChange = () => {
    if (isDialogOpen) {
      clearAllSelectedItems();
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
