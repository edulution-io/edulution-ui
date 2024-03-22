import {
  FileSharingIcon,
  TeacherIcon,
  ProjectIcon,
  IsoIcon,
  ProgrammIcon,
  ShareIcon,
  StudentsIcon,
} from '@/assets/icons';
import { useState, useEffect } from 'react';
import { MdOutlineNoteAdd } from 'react-icons/md';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import useFileManagerStore from '@/store/fileManagerStore';
import MenuItem from '@/datatypes/types';
import { DirectoryFile } from '@/datatypes/filesystem';

const findCorrespondingMountPointIcon = (mounts: DirectoryFile): string => {
  if (mounts.filename.includes('teachers')) {
    return TeacherIcon;
  }
  if (mounts.filename.includes('projects')) {
    return ProjectIcon;
  }
  if (mounts.filename.includes('iso')) {
    return IsoIcon;
  }
  if (mounts.filename.includes('programs')) {
    return ProgrammIcon;
  }
  if (mounts.filename.includes('share')) {
    return ShareIcon;
  }
  if (mounts.filename.includes('students')) {
    return StudentsIcon;
  }
  return FileSharingIcon;
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
          hoverColor: 'bg-blue-500',
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
