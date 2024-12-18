import React from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DeleteItemDialogList from '@/components/shared/DeleteItemDialogList';

const DeleteContentDialogBody: React.FC = () => {
  const { selectedItems } = useFileSharingStore();
  const deleteWarningTranslationId = 'deleteDialog.actionCannotBeUndone';

  return (
    <DeleteItemDialogList
      deleteWarningTranslationId={deleteWarningTranslationId}
      items={selectedItems.map((i) => ({ name: i.basename, id: i.etag }))}
    />
  );
};
export default DeleteContentDialogBody;
