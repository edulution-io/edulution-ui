import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentType } from '@/datatypes/filesystem';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import CreateContentDialog from '@/components/ui/Dialog/CreateContentDialog';
import { generateDOCX, generatePPTX, generateXLSX } from '@/pages/FileSharing/utilities/fileManagerUtilits.ts';
import useUserStore from '@/store/userStore.ts';

interface CreateNewContentDialogProps {
  trigger: React.ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [fileName, setFileName] = useState('');
  const [directoryName, setDirectoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileEnding, setSelectedFileEnding] = useState('.txt');
  const { handleWebDavAction, setFileOperationSuccessful, createNewFile, createNewFolder, currentPath, uploadFile } =
    useFileManagerStore();

  const onSubmit = async () => {
    const name = contentType === ContentType.file ? fileName : directoryName;
    if (!name) return;

    let blob: Blob | null = null;
    let filename = '';
    if (contentType === ContentType.file) {
      filename = `${name}${fileEnding}`;
    } else {
      filename = `${name}`;
    }

    switch (fileEnding) {
      case '.pptx':
        blob = await generatePPTX(user.username);
        break;
      case '.xlsx':
        blob = generateXLSX(user.username);
        break;
      case '.docx':
        blob = await generateDOCX(user.username);
        break;
      default:
        break;
    }

    if (blob) {
      const file = new File([blob], filename);

      setIsDialogOpen(false);
      try {
        const resp = await uploadFile(file, currentPath || '/');
        if (resp.success) {
          await setFileOperationSuccessful(true, t('fileCreateNewContent.fileOperationSuccessful'));
        } else {
          await setFileOperationSuccessful(false, t('fileCreateNewContent.unknownErrorOccurred'));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        await setFileOperationSuccessful(false, errorMessage);
      }
    } else {
      try {
        const action = contentType === ContentType.file ? createNewFile : createNewFolder;
        const resp = await handleWebDavAction(() => action(filename, currentPath));
        if (resp.success) {
          await setFileOperationSuccessful(true, t('fileCreateNewContent.fileOperationSuccessful'));
        } else {
          await setFileOperationSuccessful(false, t('fileCreateNewContent.unknownErrorOccurred'));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
        await setFileOperationSuccessful(false, errorMessage);
      } finally {
        setFileName('');
        setDirectoryName('');
        setIsDialogOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setFileName('');
      setDirectoryName('');
      setSelectedFileEnding('.txt');
    }
  }, [isDialogOpen]);

  const handleFileEndingChange = (fileEnding: string) => {
    setSelectedFileEnding(fileEnding);
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
      onOpenChange={(isOpen) => setIsDialogOpen(isOpen)}
      fileEndings={['.txt', '.docx', '.xlsx', '.pptx']}
      showFileEndingsDropdown={contentType === ContentType.file}
      onFileEndingChange={handleFileEndingChange}
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
