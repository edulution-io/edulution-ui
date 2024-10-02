import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FileActionType from '@libs/filesharing/types/fileActionType';

interface FileActionButtonProps {
  openDialog: (action: FileActionType) => void;
  selectedItem?: DirectoryFileDTO;
}

export default FileActionButtonProps;
