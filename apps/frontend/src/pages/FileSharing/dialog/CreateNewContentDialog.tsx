import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import React, { ReactNode, useState } from 'react';
import { Button } from '@/components/shared/Button';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/store/fileManagerStore';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import { ContentType } from '@/datatypes/filesystem';
import useMediaQuery from '@/hooks/media/useMediaQuery';

interface CreateNewContentDialogProps {
  trigger: ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const {
    fileName,
    setFileName,
    directoryName,
    setDirectoryName,
    currentPath,
    setFileOperationSuccessful,
    fetchFiles,
    handleWebDavAction,
  } = useFileManagerStore();

  const createFile = async (path: string): Promise<void> => {
    await handleWebDavAction(() => WebDavFunctions.createFile(`${currentPath}/${path}`))
      .then(async (resp) => {
        if ('message' in resp) {
          setFileOperationSuccessful(resp.success, resp.message);
        } else {
          setFileOperationSuccessful(resp.success, 'no message');
        }
        await fetchFiles(currentPath);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setFileOperationSuccessful(false, errorMessage);
      });
  };

  const createDirectory = async (path: string): Promise<void> => {
    await handleWebDavAction(() => WebDavFunctions.createDirectory(`${currentPath}/${path}`))
      .then(async (resp) => {
        if ('message' in resp) {
          setFileOperationSuccessful(resp.success, resp.message);
        } else {
          setFileOperationSuccessful(resp.success, '');
        }
        await fetchFiles(currentPath);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setFileOperationSuccessful(false, errorMessage);
      });
  };

  const handleCreateContent = async () => {
    if (contentType === ContentType.file) {
      await createFile(fileName);
    } else {
      await createDirectory(directoryName);
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setDirectoryName('');
      setFileName('');
    }
  };

  const mobileContent = (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex flex-col"
      >
        <SheetHeader>
          {contentType === ContentType.file ? (
            <>
              <SheetTitle>Name your new File</SheetTitle>
              <SheetDescription>
                <FileCreationForm />
              </SheetDescription>
            </>
          ) : (
            <>
              <SheetTitle>Create New Directory</SheetTitle>
              <SheetDescription>
                <DirectoryCreationForm />
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        <div className="mt-4 flex justify-end px-6">
          <Button
            variant="btn-collaboration"
            disabled={directoryName.length <= 0 && fileName.length <= 0}
            onClick={() => {
              handleCreateContent().catch(() => null);
            }}
          >
            Create
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
  const desktopContent = (
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
          variant="btn-collaboration"
          disabled={directoryName.length <= 0 && fileName.length <= 0}
          onClick={() => {
            handleCreateContent().catch(() => null);
          }}
        >
          Create
        </Button>
      </div>
    </DialogHeader>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>{desktopContent}</DialogContent>
    </Dialog>
  );
};

export default CreateNewContentDialog;
