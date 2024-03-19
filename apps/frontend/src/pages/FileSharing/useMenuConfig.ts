import { FileSharing, Desktop, Share, Students, Lernmanagement } from '@/assets/icons';
import { useState, useEffect } from 'react';
import { MdOutlineNoteAdd } from 'react-icons/md';
import { getFileNameFromPath } from '@/utils/common';
import  useFileManagerStore  from '@/store/fileManagerStore';
import MenuItem from '@/datatypes/types';
import { DirectoryFile } from '@/datatypes/filesystem';

const findCorrespondingMountPointIcon = (mounts: DirectoryFile): string => {
  if (mounts.filename.includes('teachers')) {
    return Lernmanagement;
  }
  if (mounts.filename.includes('projects')) {
    return Share;
  }
  if (mounts.filename.includes('iso')) {
    return Share;
  }
  if (mounts.filename.includes('programs')) {
    return Desktop;
  }
  if (mounts.filename.includes('share')) {
    return Share;
  }
  if (mounts.filename.includes('students')) {
    return Students;
  }
  return FileSharing;
};

const useMenuItems = () => {
  const { fetchMountPoints, fetchFiles } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchAndPrepareMenuItems = async () => {
      try {
        const mounts: DirectoryFile[] = await fetchMountPoints();
        const items = mounts.map((mountPoint) => ({
          label: getFileNameFromPath(mountPoint.filename),
          IconComponent: MdOutlineNoteAdd,
          icon: findCorrespondingMountPointIcon(mountPoint),
          action: async () => {
            try {
              await fetchFiles(mountPoint.filename);
            } catch (error) {
              console.error('Error fetching files:', error);
            }
          },
        }));
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching mount points:', error);
      }
    };

    fetchAndPrepareMenuItems().catch(() => {});
  }, []);

  return menuItems;
};

export default useMenuItems;
