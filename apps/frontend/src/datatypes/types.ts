import { DirectoryFile } from '@/datatypes/filesystem';

interface MenuItem {
  label: string;
  icon: string;
  hoverColor?: string;
  action: () => void;
  path?: string;
}

export interface FileTypePreviewProps {
  file: DirectoryFile;
}

export default MenuItem;
