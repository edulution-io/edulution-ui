import React, { ReactNode } from 'react';
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

import WebDavFileManager from '@/webdavclient/WebDavFileManager';
import { useFileManagerStore } from '@/store/appDataStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DirectoryFile } from '../../../../datatypes/filesystem';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteAlert: React.FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
  const setSelectedItems: (items: DirectoryFile[]) => void = useFileManagerStore((state) => state.setSelectedItems);
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const webDavFileManager = new WebDavFileManager();
  const deleteItems = async (): Promise<void> => {
    try {
      const itemsToDelete = selectedItems.length > 1 ? selectedItems : file;

      await Promise.all(
        itemsToDelete.map(async (item) => {
          await webDavFileManager.deleteItem(item.filename);
        }),
      );

      setRowSelection({});
      setSelectedItems([]);
    } catch {
      /* empty */
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete those files:
            <br />
            {selectedItems.length > 0 ? (
              <>
                <strong>Selected Items:</strong>
                <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
                  {selectedItems.map((item) => (
                    <p key={item.etag}>{item.filename}</p>
                  ))}
                </ScrollArea>
              </>
            ) : (
              <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
                <strong>Selected Items:</strong>
                {file.map((item) => (
                  <p key={item.etag}>{item.filename}</p>
                ))}
              </ScrollArea>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteItems().catch((error) => {
                console.error('Failed to delete items', error);
              });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlert;
