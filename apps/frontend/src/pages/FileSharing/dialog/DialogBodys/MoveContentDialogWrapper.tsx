import React from 'react';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import MoveContentDialogProps from '@libs/filesharing/types/moveContentDialogProps';
import ContentType from '@libs/filesharing/types/contentType';

const MoveContentDialogWrapper: React.FC<Omit<MoveContentDialogProps, 'pathToFetch'>> = (props) => {
  const { homePath } = useUserPath();

  return (
    <MoveContentDialogBody
      {...props}
      showAllFiles
      pathToFetch={homePath}
      fileType={ContentType.DIRECTORY}
    />
  );
};

export default MoveContentDialogWrapper;
