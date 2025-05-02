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
import ContentType from '@libs/filesharing/types/contentType';
import { HttpMethods } from '@libs/common/types/http-methods';
import MAX_UPLOAD_CHUNK_SIZE from '@libs/ui/constants/maxUploadChunkSize';
import splitArrayIntoChunks from '@libs/common/utils/splitArrayIntoChunks';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import getFileSharingFormSchema from '../formSchema';

interface CreateContentDialogProps {
  trigger?: React.ReactNode;
}

interface BatchUploadOptions {
  uploads: FileUploadProps[];
  batchSize: number;
  destinationPath: string;
  actionType: FileActionType;
  endpointUrl: string;
  method: HttpMethods;
  requestContentType: ContentType;
  handleFileUploadAction: (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethods,
    type: ContentType,
    formData: FormData,
  ) => Promise<void>;
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
    isSubmitButtonDisabled,
    setSubmitButtonIsDisabled,
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
    setSubmitButtonIsDisabled(false);
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setSelectedFileType('');
    setFilesToUpload([]);
    closeDialog();
    form.reset();
  };

  const processFileUploadsInBatches = async ({
    uploads,
    batchSize,
    destinationPath,
    actionType,
    endpointUrl,
    method,
    requestContentType,
    handleFileUploadAction,
  }: BatchUploadOptions) => {
    const batches = splitArrayIntoChunks(uploads, batchSize);

    await batches.reduce<Promise<void>>(async (prevPromise, batch) => {
      await prevPromise;

      await Promise.all(
        batch.map(async (uploadItem) => {
          if ('file' in uploadItem && uploadItem.file instanceof File) {
            const formData = new FormData();
            formData.append('file', uploadItem.file);
            formData.append('path', uploadItem.path);
            formData.append('name', uploadItem.name);
            formData.append('currentPath', destinationPath);

            return handleFileUploadAction(actionType, endpointUrl, method, requestContentType, formData);
          }
          return Promise.resolve();
        }),
      );
    }, Promise.resolve());
  };

  const onSubmit = async () => {
    const documentVendor = getDocumentVendor(appConfigs);

    const uploadPayload = await getData(form, currentPath, {
      selectedItems,
      moveOrCopyItemToPath,
      selectedFileType,
      filesToUpload,
      documentVendor,
    });

    const hasFilesToUpload =
      Array.isArray(uploadPayload) && uploadPayload.some((item) => 'file' in item && item.file instanceof File);

    if (hasFilesToUpload) {
      await processFileUploadsInBatches({
        uploads: uploadPayload as FileUploadProps[],
        batchSize: MAX_UPLOAD_CHUNK_SIZE,
        destinationPath: currentPath,
        actionType: action,
        endpointUrl: endpoint,
        method: httpMethod,
        requestContentType: type,
        handleFileUploadAction: handleItemAction,
      });
    } else {
      setSubmitButtonIsDisabled(false);
      await handleItemAction(action, endpoint, httpMethod, type, uploadPayload);
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
              <DialogFooterButtons
                handleClose={handelOpenChange}
                handleSubmit={handleFormSubmit}
                submitButtonText={submitKey}
                submitButtonType="submit"
                disableSubmit={isLoading || isSubmitButtonDisabled}
              />
            </form>
          </div>
        )
      }
    />
  );
};

export default ActionContentDialog;
