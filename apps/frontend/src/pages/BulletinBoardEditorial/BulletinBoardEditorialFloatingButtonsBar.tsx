import React from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';

const BulletinBoardEditorialFloatingButtonsBar: React.FC = () => {
  const {
    selectedRows,
    bulletins,
    setIsDeleteBulletinDialogOpen,
    setIsCreateBulletinDialogOpen,
    setSelectedBulletinToEdit,
  } = useBulletinBoardEditorialStore();
  const selectedBulletinIds = Object.keys(selectedRows);

  const config: FloatingButtonsBarConfig = {
    buttons: [
      DeleteButton(() => setIsDeleteBulletinDialogOpen(true), selectedBulletinIds.length > 0),
      EditButton(() => {
        setIsCreateBulletinDialogOpen(true);
        setSelectedBulletinToEdit(bulletins.find((b) => b.id === selectedBulletinIds[0]) || null);
      }, selectedBulletinIds.length === 1),
      CreateButton(() => setIsCreateBulletinDialogOpen(true)),
    ],
    keyPrefix: 'bulletin-board-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default BulletinBoardEditorialFloatingButtonsBar;
