import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentType } from '@/datatypes/filesystem';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import CreateContentDialog from '@/components/ui/Dialog/CreateContentDialog';
import {
  generateDOCX,
  generateDrawIo,
  generatePPTX,
  generateXLSX,
} from '@/pages/FileSharing/utilities/fileManagerUtilits.ts';
import useUserStore from '@/store/userStore.ts';

interface CreateNewContentDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  contentType: ContentType;
  setIsOpen?: (isOpen: boolean) => void;
  fileType?: string;
  fileTypeName?: string;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({
  trigger,
  contentType,
  isOpen: externalIsOpen,
  setIsOpen: setExternalIsOpen,
  fileType,
  fileTypeName,
}) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [fileName, setFileName] = useState('');
  const [directoryName, setDirectoryName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { handleWebDavAction, setFileOperationSuccessful, createNewFolder, currentPath, uploadFile } =
    useFileManagerStore();

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const onSubmit = async () => {
    const name = contentType === ContentType.file ? fileName : directoryName;
    if (!name) return;

    let blob: Blob | null = null;
    let filename = '';
    if (contentType === ContentType.file) {
      filename = `${name}${fileType}`;
    } else {
      filename = `${name}`;
    }

    try {
      if (contentType === ContentType.file) {
        switch (fileType) {
          case '.pptx':
            blob = await generatePPTX(user);
            break;
          case '.xlsx':
            blob = generateXLSX(user);
            break;
          case '.docx':
            blob = await generateDOCX(user);
            break;
          case '.drawio':
            blob = generateDrawIo();
            break;
          default:
            break;
        }

        if (blob) {
          const file = new File([blob], filename);
          const resp = await uploadFile(file, currentPath || '/');
          if (resp.success) {
            await setFileOperationSuccessful(true, t('fileCreateNewContent.fileOperationSuccessful'));
          } else {
            await setFileOperationSuccessful(false, t('fileCreateNewContent.unknownErrorOccurred'));
          }
        }
      } else {
        const resp = await handleWebDavAction(() => createNewFolder(filename, currentPath));
        if (resp.success) {
          await setFileOperationSuccessful(true, t('fileCreateNewContent.fileOperationSuccessful'));
        } else {
          await setFileOperationSuccessful(false, t('fileCreateNewContent.unknownErrorOccurred'));
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
      await setFileOperationSuccessful(false, errorMessage);
    } finally {
      setFileName('');
      setDirectoryName('');
      setIsOpen(false);
      if (setExternalIsOpen) {
        setExternalIsOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFileName('');
      setDirectoryName('');
    }
  }, [isOpen]);

  const isFormInvalid = contentType === ContentType.file ? fileName.length === 0 : directoryName.length === 0;
  const formTitle =
    contentType === ContentType.file
      ? t('fileCreateNewContent.fileDialogTitle', { name: fileTypeName })
      : t('fileCreateNewContent.directoryDialogTitle');
  const FormComponent = contentType === ContentType.file ? FileCreationForm : DirectoryCreationForm;

  return (
    <CreateContentDialog
      trigger={trigger}
      title={formTitle}
      onSubmit={onSubmit}
      isDisabled={isFormInvalid}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
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
