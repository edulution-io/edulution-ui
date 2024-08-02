import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';

interface DialogInputValues {
  selectedItems?: DirectoryFileDTO[];
  moveItemsToPath?: DirectoryFileDTO;
  selectedFileType?: { extension: string; generate: string };
  filesToUpload?: File[];
}

export default DialogInputValues;
