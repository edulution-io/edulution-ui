import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentType } from '@/datatypes/filesystem';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import CreateContentDialog from '@/components/ui/Dialog/CreateContentDialog';

interface CreateNewContentDialogProps {
  trigger: React.ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [directoryName, setDirectoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog visibility
  const { handleWebDavAction, setFileOperationSuccessful, createNewFile, createNewFolder, currentPath } =
    useFileManagerStore();

  const onSubmit = async () => {
    const name = contentType === ContentType.file ? fileName : directoryName;
    const action = contentType === ContentType.file ? createNewFile : createNewFolder;
    if (!name) return;

    try {
      const resp = await handleWebDavAction(() => action(name, currentPath));
      if (resp.success) {
        await setFileOperationSuccessful(true, t('fileCreateNewContent.fileOperationSuccessful'));
      } else {
        await setFileOperationSuccessful(false, t('fileCreateNewContent.unknownErrorOccurred'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
      await setFileOperationSuccessful(false, errorMessage);
    } finally {
      setIsDialogOpen(false); // Close the dialog after the operation completes
    }
  };

  const isFormInvalid = contentType === ContentType.file ? fileName.length === 0 : directoryName.length === 0;
  const formTitle =
    contentType === ContentType.file
      ? t('fileCreateNewContent.fileDialogTitle')
      : t('fileCreateNewContent.directoryDialogTitle');
  const FormComponent = contentType === ContentType.file ? FileCreationForm : DirectoryCreationForm;

  return (
    <CreateContentDialog
      trigger={trigger}
      title={formTitle}
      onSubmit={onSubmit}
      isDisabled={isFormInvalid}
      isOpen={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    >
      <FormComponent
        fileName={fileName}
        setFileName={setFileName}
        directoryName={directoryName}
        setDirectoryName={setDirectoryName}
      />
    </CreateContentDialog>
  );
};

export default CreateNewContentDialog;
