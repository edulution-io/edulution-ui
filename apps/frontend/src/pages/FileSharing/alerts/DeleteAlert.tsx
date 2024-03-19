import React, { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DirectoryFile } from '@/datatypes/filesystem';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteAlert: React.FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
  const setSelectedItems: (items: DirectoryFile[]) => void = useFileManagerStore((state) => state.setSelectedItems);
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);

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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <>
          This action cannot be undone. This will permanently delete those files:
          <br />
          {selectedItems.length > 0 ? (
            <>
              <strong>Selected Items:</strong>
              <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
                {selectedItems.map((item) => (
                  <div key={item.etag}>{item.filename}</div>
                ))}
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
              <strong>Selected Items:</strong>
              <div className="text-black">
                {file.map((item) => (
                  <div key={item.etag}>{item.filename}</div>
                ))}
              </div>
            </ScrollArea>
          )}
        </>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
            onClick={deleteItems}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteAlert.displayName = 'DeleteAlert';
export default DeleteAlert;
