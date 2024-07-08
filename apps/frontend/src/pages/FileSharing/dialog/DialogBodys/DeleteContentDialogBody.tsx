import { ScrollArea } from '@/components/ui/ScrollArea';
import React from 'react';
import useFileManagerStore from '@/pages/FileSharing/FileManagerStore';
import { useTranslation } from 'react-i18next';

export interface DeleteContentDialogBodyProps {}

const DeleteContentDialogBody: React.FC<DeleteContentDialogBodyProps> = () => {
  const { t } = useTranslation();
  const { selectedItems } = useFileManagerStore();
  return (
    <div className="text-black">
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
