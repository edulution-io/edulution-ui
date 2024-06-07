import React, { FC, ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import GeneralDeleteDialog from '@/components/ui/Dialog/GeneralDeleteDialog.tsx';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteItemAlert: FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const { selectedItems, setSelectedItems, setFileOperationSuccessful, deleteItem } = useFileManagerStore();
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const { t } = useTranslation();

  const deleteItems = async () => {
    try {
      const itemsToDelete = selectedItems.length > 0 ? selectedItems : [file].flat();
      const deleteResults = await Promise.all(
        itemsToDelete.map(async (item) => deleteItem(item.filename.replace('/webdav/', ''))),
      );
      const allSuccessful = deleteResults.every((result) => result);
      const combinedMessage = deleteResults
        .map((result, index) => `Item ${itemsToDelete[index].basename}: ${result.success || 'No message provided'}`)
        .join('; ');
      setFileOperationSuccessful(allSuccessful, combinedMessage).catch(console.error);
      if (allSuccessful) {
        setRowSelection({});
        setSelectedItems([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during deletion';
      setFileOperationSuccessful(false, errorMessage).catch(console.error);
    }
  };

  const contentToDelete = (
    <div>
      <ScrollArea className="min-h-[200px] bg-white">
        <strong>{t('deleteDialog.actionCannotBeUndone')}</strong>
        {(selectedItems.length > 0 ? selectedItems : file).map((item) => (
          <div
            className="pt-3 text-black"
            key={item.etag}
          >
            {item.filename}
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  return (
    <GeneralDeleteDialog
      trigger={trigger}
      title={t('deleteDialog.deleteFiles')}
      content={contentToDelete}
      onConfirm={deleteItems}
    />
  );
};

DeleteItemAlert.displayName = 'DeleteItemAlert';
export default DeleteItemAlert;
