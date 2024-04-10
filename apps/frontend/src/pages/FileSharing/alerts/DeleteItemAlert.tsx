import React, { ReactNode, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';

import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { useMediaQuery } from 'usehooks-ts';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';

interface DeleteDialogProps {
  trigger: ReactNode;
  file: DirectoryFile[];
}

const DeleteItemAlert: React.FC<DeleteDialogProps> = ({ trigger, file = [] }) => {
  const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
  const setSelectedItems: (items: DirectoryFile[]) => void = useFileManagerStore((state) => state.setSelectedItems);
  const setRowSelection = useFileManagerStore((state) => state.setSelectedRows);
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);
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
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteDialog.areYouSure')}</DialogTitle>
        </DialogHeader>
        {contentToDelete}
        <DialogFooter>
          <Button
            variant="btn-attention"
            onClick={deleteItems}
          >
            {t('deleteDialog.continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

DeleteItemAlert.displayName = 'DeleteItemAlert';
export default DeleteItemAlert;
