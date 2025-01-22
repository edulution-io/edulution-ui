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
    const data = await getData(form, currentPath, {
      selectedItems,
      moveOrCopyItemToPath,
      selectedFileType,
      filesToUpload,
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
          <div className="rounded-xl bg-ciLightRed py-3 text-center text-foreground">{error.message}</div>
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
