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
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import getDialogBodyConfigurations from '@/pages/FileSharing/Dialog/DialogBodys/getDialogBodyConfigurations';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FileActionType from '@libs/filesharing/types/fileActionType';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDocumentVendor from '@libs/filesharing/utils/getDocumentVendor';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
import ContentType from '@libs/filesharing/types/contentType';
import { HttpMethods } from '@libs/common/types/http-methods';
import MAX_UPLOAD_CHUNK_SIZE from '@libs/ui/constants/maxUploadChunkSize';
import splitArrayIntoChunks from '@libs/common/utils/splitArrayIntoChunks';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import UploadFileDto from '@libs/filesharing/types/uploadFileDto';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import { FileSharingFormValues } from '@libs/filesharing/types/filesharingDialogProps';
import useKeyboardShortcut from '@/hooks/useKeyboardShortcut';

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
    webdavShare: string | undefined,
  ) => Promise<void>;
}

const ActionContentDialog: React.FC<CreateContentDialogProps> = ({ trigger }) => {
  const { webdavShare } = useParams();
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
    setSelectedFileType,
    setMoveOrCopyItemToPath,
    isSubmitButtonDisabled,
    setSubmitButtonIsDisabled,
  } = useFileSharingDialogStore();
  const { currentPath, selectedItems, setSelectedItems, setSelectedRows } = useFileSharingStore();
  const { appConfigs } = useAppConfigsStore();

  const {
    Component,
    schema,
    titleKey,
    submitKey,
    initialValues,
    endpoint,
    httpMethod,
    requiresForm,
    type,
    getData,
    desktopComponentClassName,
    isRenaming = false,
    mobileComponentClassName,
    hideSubmitButton = false,
  } = getDialogBodyConfigurations(action);

  const form = useForm<FileSharingFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues: initialValues,
  });

  const clearAllSelectedItems = () => {
    setSubmitButtonIsDisabled(false);
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setSelectedFileType('');
    setSelectedItems([]);
    setSelectedRows({});
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

    await batches.reduce<Promise<void>>(async (previousBatch, batch) => {
      await previousBatch;
      const uploadPromises = batch
        .filter((item): item is typeof item & { file: File } => 'file' in item && item.file instanceof File)
        .map((uploadItem) => {
          const uploadDto: UploadFileDto = {
            name: uploadItem.name,
            isZippedFolder: 'isZippedFolder' in uploadItem.file && uploadItem.file.isZippedFolder,
            ...(uploadItem.file.originalFolderName && {
              originalFolderName: uploadItem.file.originalFolderName,
            }),
          };

          const formData = new FormData();
          formData.append('uploadFileDto', JSON.stringify(uploadDto));
          formData.append('currentPath', destinationPath);
          formData.append('file', uploadItem.file);
          formData.append('path', uploadItem.path);

          return handleFileUploadAction(actionType, endpointUrl, method, requestContentType, formData, webdavShare);
        });

      await Promise.all(uploadPromises);
    }, Promise.resolve());
  };

  const onSubmit = async () => {
    const documentVendor = getDocumentVendor(appConfigs);
    if (!getData) return;
    const uploadPayload = await getData(form, currentPath, {
      selectedItems,
      moveOrCopyItemToPath,
      selectedFileType,
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
      await handleItemAction(action, endpoint, httpMethod, type, uploadPayload as PathChangeOrCreateProps, webdavShare);
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

  const isSubmitDisabled =
    isLoading ||
    isSubmitButtonDisabled ||
    (requiresForm && !form.formState.isValid) ||
    (action === FileActionType.MOVE_FILE_OR_FOLDER && moveOrCopyItemToPath?.filePath === undefined);

  const title = action === FileActionType.CREATE_FILE ? t(`fileCreateNewContent.${selectedFileType}`) : t(titleKey);
  const handleFormSubmit = form.handleSubmit(onSubmit);

  useKeyboardShortcut([
    {
      key: 'Enter',
      callback: () => {
        if (isDialogOpen && !isSubmitDisabled) {
          void handleFormSubmit();
        }
      },
    },
  ]);

  return (
    <AdaptiveDialog
      isOpen={isDialogOpen}
      handleOpenChange={handelOpenChange}
      trigger={trigger}
      title={t(title)}
      desktopContentClassName={desktopComponentClassName}
      mobileContentClassName={mobileComponentClassName}
      body={
        <Component
          form={form}
          isRenaming={isRenaming}
        />
      }
      footer={
        error ? (
          <div className="rounded-xl bg-ciLightRed py-3 text-center text-background">{error.message}</div>
        ) : (
          <div className="mt-4 flex justify-end">
            <form onSubmit={handleFormSubmit}>
              <DialogFooterButtons
                handleClose={handelOpenChange}
                handleSubmit={hideSubmitButton ? undefined : handleFormSubmit}
                submitButtonText={submitKey}
                submitButtonType="submit"
                disableSubmit={
                  isLoading ||
                  isSubmitButtonDisabled ||
                  (requiresForm && !form.formState.isValid) ||
                  (action === FileActionType.MOVE_FILE_OR_FOLDER && moveOrCopyItemToPath?.filePath === undefined)
                }
              />
            </form>
          </div>
        )
      }
    />
  );
};

export default ActionContentDialog;
