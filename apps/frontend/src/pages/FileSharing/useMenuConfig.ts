import { useState, useEffect } from 'react';
import useFileManagerStore from '@/store/fileManagerStore';
import { MenuBarEntryProps, MenuItem } from '@/datatypes/types';
import { DirectoryFile } from '@/datatypes/filesystem';
import {
  FileSharingIcon,
  IsoIcon,
  ProgrammIcon,
  ProjectIcon,
  ShareIcon,
  StudentsIcon,
  TeacherIcon,
} from '@/assets/icons';
import { useTranslation } from 'react-i18next';

const findCorrespondingMountPointIcon = (mounts: DirectoryFile) => {
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

const useFileSharingMenuConfig = () => {
  const { t } = useTranslation();
  const { fetchMountPoints, fetchFiles } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  function constructFilePath(mountPoint: DirectoryFile, username: string) {
    return mountPoint.filename.includes('teachers') ? `${mountPoint.filename}/${username}` : mountPoint.filename;
  }

  useEffect(() => {
    const fetchAndPrepareMenuItems = async () => {
      try {
        const mounts: DirectoryFile[] = await fetchMountPoints();
        const items = mounts.map((mountPoint) => ({
          id: mountPoint.basename,
          label: mountPoint.filename.includes('teachers') ? 'Home' : mountPoint.basename,
          icon: findCorrespondingMountPointIcon(mountPoint),
          action: async () => {
            try {
              await fetchFiles(constructFilePath(mountPoint, sessionStorage.getItem('user') as string));
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

  const fileSharingMenuConfig = (): MenuBarEntryProps => ({
    menuItems,
    title: t('filesharing.title'),
    icon: FileSharingIcon,
    color: 'hover:bg-ciDarkBlue',
  });

  return fileSharingMenuConfig();
};

export default useFileSharingMenuConfig;
