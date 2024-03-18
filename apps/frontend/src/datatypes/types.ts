import { DirectoryFile } from '@/datatypes/filesystem';

interface MenuItem {
  label: string;
  icon: string;
  action: () => void;
}

export interface FileTypePreviewProps {
  file: DirectoryFile;
}

export default MenuItem;
