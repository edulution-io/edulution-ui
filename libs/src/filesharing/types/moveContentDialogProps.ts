import ContentType from '@libs/filesharing/types/contentType';

interface MoveContentDialogBodyProps {
  showAllFiles?: boolean;
  pathToFetch?: string;
  showSelectedFile?: boolean;
  showHome?: boolean;
  fileType?: ContentType;
}

export default MoveContentDialogBodyProps;
