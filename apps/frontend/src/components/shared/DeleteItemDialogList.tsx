import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';

const DeleteItemDialogList = ({
  deleteWarningTranslationId,
  items,
}: {
  items: { id: string; name: string }[];
  deleteWarningTranslationId: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-foreground">
      <p>{t(deleteWarningTranslationId)}</p>
      <ScrollArea className="mt-2 h-64 w-96 overflow-y-auto rounded border p-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="truncate"
          >
            {item.name}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default DeleteItemDialogList;
