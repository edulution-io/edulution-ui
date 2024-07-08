import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import getDialogBodySetup from '@/pages/FileSharing/dialog/DialogBodys/dialogBodyConfigurations';
import { z } from 'zod';
import useFileManagerStore from '@/pages/FileSharing/FileManagerStore';
import ActionItems from '@/pages/FileSharing/dialog/ActionsType/ActionItems';
import { AVAILABLE_FILE_TYPES, FileTypeKey } from '@/pages/FileSharing/fileoperations/fileCreationDropDownOptions';
import { DirectoryFile } from '@libs/filesharing/filesystem';

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
  const { currentPath, selectedItems } = useFileManagerStore();

  const { Component, schema, titleKey, submitKey, initialValues, endpoint, httpMethod, getData } =
    getDialogBodySetup(action);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type FormDataType = typeof schema extends z.ZodSchema<any> ? z.infer<typeof schema> : Record<string, unknown>;

  const form = useForm<FormDataType>({
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
      setUserInput(filename as string);
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

  const title = action === ActionItems.CREATE_FILE ? t(`fileCreateNewContent.${selectedFileType.type}`) : t(titleKey);
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
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">{error.message}</div>
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
