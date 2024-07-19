import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import getDialogBodySetup from '@/pages/FileSharing/dialog/DialogBodys/dialogBodyConfigurations';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import FileAction from '@libs/filesharing/FileAction';
import AVAILABLE_FILE_TYPES from '@libs/ui/types/filesharing/AvailableFileTypes';
import { FileTypeKey } from '@libs/ui/types/filesharing/FileTypeKey';
import { FormValues } from '@libs/ui/types/filesharing/FilesharingDialogProps';

interface CreateContentDialogProps {
  trigger?: React.ReactNode;
}

const ActionContentDialog: React.FC<CreateContentDialogProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const {
    isDialogOpen,
    closeDialog,
    moveItemsToPath,
    openDialog,
    setUserInput,
    isLoading,
    error,
    action,
    handleItemAction,
    selectedFileType,
    filesToUpload,
    setSelectedFileType,
    setMoveItemsToPath,
    setFilesToUpload,
  } = useFileSharingDialogStore();
  const { currentPath, selectedItems } = useFileSharingStore();

  const { Component, schema, titleKey, submitKey, initialValues, endpoint, httpMethod, getData } =
    getDialogBodySetup(action);

  const form = useForm<FormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues: initialValues || {},
  });

  const clearAllSelectedItems = () => {
    setMoveItemsToPath({} as DirectoryFile);
    setSelectedFileType({} as (typeof AVAILABLE_FILE_TYPES)[FileTypeKey]);
    setFilesToUpload([]);
  };

  const onSubmit = async () => {
    if (schema) {
      const filename = form.getValues('filename');
      setUserInput(filename);
    }

    const data = await getData(form, currentPath, { selectedItems, moveItemsToPath, selectedFileType, filesToUpload });

    if (Array.isArray(data) && data.some((item) => 'file' in item && item.file instanceof File)) {
      const uploadPromises = data.map((item) => {
        if ('file' in item && item.file instanceof File) {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('path', item.path);
          formData.append('name', item.name);
          return handleItemAction(action, endpoint, httpMethod, formData);
        }
        return Promise.resolve();
      });

      await Promise.all(uploadPromises);
    } else {
      await handleItemAction(action, endpoint, httpMethod, data as Record<string, string>);
    }

    clearAllSelectedItems();
    form.reset();
  };

  const handelOpenChange = () => {
    if (isDialogOpen) {
      closeDialog();
      form.reset();
    } else {
      openDialog(action);
    }
  };

  const title = action === FileAction.CREATE_FILE ? t(`fileCreateNewContent.${selectedFileType.type}`) : t(titleKey);
  const handleFormSubmit = form.handleSubmit(onSubmit);
  return (
    <AdaptiveDialog
      isOpen={isDialogOpen}
      handleOpenChange={handelOpenChange}
      trigger={trigger}
      title={t(title)}
      body={isLoading ? <LoadingIndicator isOpen={isLoading} /> : <Component form={form} />}
      footer={
        error ? (
          <div className="rounded-xl  bg-ciLightRed py-3 text-center text-foreground">{error.message}</div>
        ) : (
          <div className="mt-4 flex justify-end">
            <form onSubmit={handleFormSubmit}>
              <Button
                variant="btn-collaboration"
                disabled={isLoading}
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
