import { FC, ReactNode } from 'react';
import { ItemTypes } from '@/pages/SchoolmanagementPage/utilis/enums.ts';
import GeneralDeleteDialog from '@/components/ui/Dialog/GeneralDeleteDialog.tsx';
import { t } from 'i18next';

interface DeleteItemDialogProps {
  trigger?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  item: { itemEditName: string; type: string };
}

const DeleteItemDialog: FC<DeleteItemDialogProps> = ({ trigger, isOpen, item, onOpenChange }) => {
  const deleteItem = async () => {
    console.log('Item deleted');
  };

  return (
    <GeneralDeleteDialog
      trigger={trigger}
      isOpen={isOpen}
      title={
        item.type === ItemTypes.SESSION
          ? t('schoolManagement.deleteSession', { name: item.itemEditName })
          : t('schoolManagement.deleteProject', { name: item.itemEditName })
      }
      onConfirm={deleteItem}
      onOpenChange={onOpenChange}
      content={''}
    />
  );
};

export default DeleteItemDialog;