import React from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ItemDialogList from '@/components/shared/ItemDialogList';

const DeleteContentDialogBody: React.FC = () => {
  const { selectedItems } = useFileSharingStore();
  const deleteWarningTranslationId = 'deleteDialog.actionCannotBeUndone';

  return (
    <ItemDialogList
      deleteWarningTranslationId={deleteWarningTranslationId}
      items={selectedItems.map((i) => ({ name: i.basename, id: i.etag }))}
    />
  );
};
export default DeleteContentDialogBody;
