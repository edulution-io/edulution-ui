import { ScrollArea } from '@/components/ui/ScrollArea';
import React from 'react';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import { useTranslation } from 'react-i18next';
import EmptyDialogProps from '@libs/ui/types/filesharing/FilesharingEmptyProps';

const DeleteContentDialogBody: React.FC<EmptyDialogProps> = () => {
  const { t } = useTranslation();
  const { selectedItems } = useFileSharingStore();
  return (
    <div className="text-foreground">
      <p>{t('deleteDialog.actionCannotBeUndone')}</p>
      <ScrollArea className="mt-2 h-64 w-96 max-w-full overflow-y-auto rounded border p-2">
        {selectedItems.map((item) => (
          <div
            key={item.etag}
            className="truncate"
          >
            {item.basename}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
export default DeleteContentDialogBody;
