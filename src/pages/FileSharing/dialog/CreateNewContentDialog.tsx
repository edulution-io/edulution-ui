import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import React, { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import DirectoryCreationForm from '@/pages/FileSharing/dialog/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/dialog/FileCreationForm';
import { useFileManagerStore } from '@/store';
import WebDavFileManager from '@/webdavclient/WebDavFileManager';
import useWebDavActions from '@/utils/webDavHooks';
import { ContentType } from '../../../../datatypes/filesystem';

interface CreateNewContentDialogProps {
  trigger: ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const setFileOperationSuccessful: (fileOperationSuccessful: boolean) => void = useFileManagerStore(
    (state) => state.setFileOperationSuccessful,
  );
  const [isOpen, setIsOpen] = useState(false);
  const fileName = useFileManagerStore((state) => state.fileName);
  const setFileName = useFileManagerStore((state) => state.setFileName);
  const directoryName = useFileManagerStore((state) => state.directoryName);
  const setDirectoryName = useFileManagerStore((state) => state.setDirectoryName);
  const currentPath = useFileManagerStore((state) => state.currentPath);
  const { fetchFiles, handleWebDavAction } = useWebDavActions();
  const webDavFileManager = new WebDavFileManager();

  const createFile = async (path: string): Promise<boolean> => {
    const isSuccess = await handleWebDavAction(() => webDavFileManager.createFile(`${currentPath}/${path}`));
    if (isSuccess) {
      await fetchFiles(currentPath);
    }
    return isSuccess;
  };

  const createDirectory = async (path: string): Promise<boolean> => {
    const isSuccess = await handleWebDavAction(() => webDavFileManager.createDirectory(`${currentPath}/${path}`));
    if (isSuccess) {
      await fetchFiles(currentPath);
    }
    return isSuccess;
  };

  const handleCreateContent = async () => {
    console.log('Create new content');
    let success = false;
    if (contentType === ContentType.file) {
      success = await createFile(fileName);
    } else {
      success = await createDirectory(directoryName);
    }
    if (success) {
      setIsOpen(false);
      setFileOperationSuccessful(true);
    } else {
      setIsOpen(false);
      setFileOperationSuccessful(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setDirectoryName('');
      setFileName('');
      console.log('Dialog just closed.');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {contentType === ContentType.file ? (
            <>
              <DialogTitle>Name your new File</DialogTitle>
              <DialogDescription>
                <FileCreationForm />
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Create New Directory</DialogTitle>
              <DialogDescription>
                <DirectoryCreationForm />
              </DialogDescription>
            </>
          )}
          <div className="container mx-auto flex justify-end p-4">
            <Button
              className="w-1/4 rounded bg-blue-500 px-4 py-2 text-white"
              disabled={directoryName.length <= 0 && fileName.length <= 0}
              onClick={() => {
                handleCreateContent().catch((error) => {
                  console.error('An error occurred:', error);
                });
              }}
            >
              Create
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewContentDialog;
