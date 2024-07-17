import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import React from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import FileActionOneSelect from '@/pages/FileSharing/buttonsBar/FileActionOneSelect';
import FileActionNonSelect from '@/pages/FileSharing/buttonsBar/FileActionNonSelect';
import FileActionMultiSelect from '@/pages/FileSharing/buttonsBar/FileActionMultiSelect';

const FileSharingFloatingButtonsBar = () => {
  const { openDialog } = useFileSharingDialogStore();
  const { selectedItems } = useFileSharingStore();
  return (
    <div className="fixed bottom-8 flex flex-row bg-opacity-90">
      {selectedItems.length === 0 && <FileActionNonSelect openDialog={openDialog} />}

      {selectedItems.length === 1 && (
        <FileActionOneSelect
          openDialog={openDialog}
          selectedItem={selectedItems[0]}
        />
      )}
      {selectedItems.length > 0 && <FileActionMultiSelect openDialog={openDialog} />}
    </div>
  );
};

export default FileSharingFloatingButtonsBar;
