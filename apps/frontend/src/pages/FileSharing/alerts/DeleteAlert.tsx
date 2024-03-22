import React, { ReactNode, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DirectoryFile } from '@/datatypes/filesystem';
import { Button } from '@/components/shared/Button';
import useMediaQuery from '@/hooks/media/useMediaQuery';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteAlert: React.FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
  const setSelectedItems: (items: DirectoryFile[]) => void = useFileManagerStore((state) => state.setSelectedItems);
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);
  const deleteItems = async () => {
    try {
      const itemsToDelete = selectedItems.length > 1 ? selectedItems : [file].flat();
      const deletePromises = itemsToDelete.map((item) => WebDavFunctions.deleteItem(item.filename));
      const deleteResults = await Promise.all(deletePromises);
      const allSuccessful = deleteResults.every((result) => result.success);
      const combinedMessage = deleteResults
        .map((result, index) => `Item ${index + 1}: ${'message' in result ? result.message : 'No message provided'}`)
        .join('; ');

      setFileOperationSuccessful(allSuccessful, combinedMessage);

      if (allSuccessful) {
        setRowSelection({});
        setSelectedItems([]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during deletion';
      setFileOperationSuccessful(false, errorMessage);
    }
  };

  const sharedContent = (
    <div>
      <ScrollArea className={`max-h-[200px] ${isMobile ? 'opacity-65' : 'bg-white'}`}>
        <strong className={`${isMobile ? 'text-white' : 'text-black'}`}>Files to be deleted:</strong>
        {(selectedItems.length > 0 ? selectedItems : file).map((item) => (
          <div key={item.etag}>{item.filename}</div>
        ))}
      </ScrollArea>
    </div>
  );

  return isMobile ? (
    <Sheet
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Delete Files</SheetTitle>
        </SheetHeader>
        <SheetDescription className="bg-transparent text-white">
          {sharedContent}
          <div className="flex flex-row justify-end space-x-4 p-3 text-black">
            <Button
              variant="btn-attention"
              onClick={() => deleteItems}
            >
              Delete
            </Button>
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  ) : (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{sharedContent}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteItems}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteAlert.displayName = 'DeleteAlert';
export default DeleteAlert;
