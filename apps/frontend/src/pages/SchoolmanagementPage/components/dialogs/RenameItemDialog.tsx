import GeneralRenameDialog from '@/components/ui/Dialog/GeneralRenameDialog.tsx';
import { FC, ReactNode } from 'react';
import { t } from 'i18next';
import { ItemTypes } from '@/pages/SchoolmanagementPage/utilis/enums.ts';

interface RenameItemDialogProps {
  trigger?: ReactNode;
  isOpen?: boolean;
  item: { itemEditName: string; type: string };
  onOpenChange?: (isOpen: boolean) => void;
  isCopy?: boolean;
}

const RenameItemDialog: FC<RenameItemDialogProps> = ({ trigger, isOpen, isCopy, item, onOpenChange }) => {
  const getTitle = () => {
    if (isCopy) {
      return item.type === ItemTypes.SESSION
        ? t('schoolManagement.copySession', { name: item.itemEditName })
        : t('schoolManagement.copyProject', { name: item.itemEditName });
    }
    return item.type === ItemTypes.SESSION
      ? t('schoolManagement.renameSession', { name: item.itemEditName })
      : t('schoolManagement.renameProject', { name: item.itemEditName });
  };

  return (
    <GeneralRenameDialog
      trigger={trigger}
      isOpen={isOpen}
      title={getTitle()}
      placeholder={t('fileRenameContent.placeholder')}
      isValidInput={(input) => input.length > 0}
      onSubmit={async (newName) => console.log(newName)}
      onOpenChange={onOpenChange}
    />
  );
};

export default RenameItemDialog;
