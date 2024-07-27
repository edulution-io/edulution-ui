import EmptyDialogProps from '@libs/filesharing/types/filesharingEmptyProps';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import React from 'react';

const SharableLinkDialogBody: React.FC<EmptyDialogProps> = () => {
  const { downloadLinkURL } = useFileSharingDialogStore();

  return (
    <div>
      ShareLinkDialog
      <p>{downloadLinkURL}</p>
    </div>
  );
};

export default SharableLinkDialogBody;
