import { DirectoryFileDTO } from '@libs/filesharing/DirectoryFileDTO';
import FileActionType from '@libs/filesharing/types/fileActionType';

interface FileActionButtonProps {
  openDialog: (action: FileActionType) => void;
  selectedItem?: DirectoryFileDTO;
}

export default FileActionButtonProps;
