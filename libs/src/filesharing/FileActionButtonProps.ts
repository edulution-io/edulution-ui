import FileAction from '@libs/filesharing/FileAction';
import { DirectoryFileDTO } from '@libs/filesharing/DirectoryFileDTO';

interface FileActionButtonProps {
  openDialog: (action: FileAction) => void;
  selectedItem?: DirectoryFileDTO;
}

export default FileActionButtonProps;
