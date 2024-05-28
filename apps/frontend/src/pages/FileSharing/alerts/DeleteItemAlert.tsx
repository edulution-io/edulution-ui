import React, { ReactNode, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';

import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { useMediaQuery } from 'usehooks-ts';
import {
  DialogContentSH,
  DialogFooterSH,
  DialogHeaderSH,
  DialogSH,
  DialogTitleSH,
  DialogTriggerSH,
} from '@/components/ui/DialogSH.tsx';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteItemAlert: React.FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const { selectedItems, setSelectedItems, setFileOperationSuccessful, deleteItem } = useFileManagerStore();
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during deletion';
      setFileOperationSuccessful(false, errorMessage).catch(console.error);
    }
  };

  const contentToDelete = (
    <div>
      <ScrollArea className={`min-h-[200px] ${isMobile ? 'opacity-65' : 'bg-white'}`}>
        <strong className={`${isMobile ? 'text-white' : 'text-black'}`}>
          {t('deleteDialog.actionCannotBeUndone')}
        </strong>
        {(selectedItems.length > 0 ? selectedItems : file).map((item) => (
          <div
            className={`${isMobile ? 'text-white' : 'text-black'} pt-3`}
            key={item.etag}
          >
            {item.filename}
          </div>
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
          <SheetTitle>${t('deleteDialog.deleteFiles')}</SheetTitle>
        </SheetHeader>
        <div>{contentToDelete}</div>
        <div className="flex flex-row justify-end space-x-4 pt-3 text-black">
          <Button
            variant="btn-attention"
            onClick={deleteItems}
          >
            {t('deleteDialog.continue')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <DialogSH
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      <DialogContentSH>
        <DialogHeaderSH>
          <DialogTitleSH>{t('deleteDialog.areYouSure')}</DialogTitleSH>
        </DialogHeaderSH>
        {contentToDelete}
        <DialogFooterSH>
          <Button
            variant="btn-attention"
            onClick={deleteItems}
          >
            {t('deleteDialog.continue')}
          </Button>
        </DialogFooterSH>
      </DialogContentSH>
    </DialogSH>
  );
};

DeleteItemAlert.displayName = 'DeleteItemAlert';
export default DeleteItemAlert;
