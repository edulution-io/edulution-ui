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
} from '@/components/ui/AlertDialog';

import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteItemAlert: React.FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
  const setSelectedItems: (items: DirectoryFile[]) => void = useFileManagerStore((state) => state.setSelectedItems);
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
  const { t } = useTranslation();
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
          <AlertDialogTitle>{t('deleteDialog.areYouSure')}</AlertDialogTitle>
        </AlertDialogHeader>
        <>
          {t('deleteDialog.actionCannotBeUndone')}
          <br />
          {selectedItems.length > 0 ? (
            <>
              <strong>{t('deleteDialog.selectedItems')}</strong>
              <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
                {selectedItems.map((item) => (
                  <div key={item.etag}>{item.filename}</div>
                ))}
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
              <strong>{t('deleteDialog.selectedItems')}</strong>
              <div className="text-black">
                {file.map((item) => (
                  <div key={item.etag}>{item.filename}</div>
                ))}
              </div>
            </ScrollArea>
          )}
        </>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteItems}>{t('deleteDialog.continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteItemAlert.displayName = 'DeleteItemAlert';
export default DeleteItemAlert;
