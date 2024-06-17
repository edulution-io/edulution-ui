import { useEffect, useState } from 'react';
import useFileManagerStoreOLD from '@/store/fileManagerStoreOLD';
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
  const { fetchMountPoints, fetchFiles } = useFileManagerStoreOLD();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  function constructFilePath(mountPoint: DirectoryFile, username: string) {
    return mountPoint.filename.includes('teachers') ? `${mountPoint.filename}/${username}` : mountPoint.filename;
  }

  type UserDataConfig = { state: { user: string; webdavKey: string; isAuthenticated: boolean } };

  useEffect(() => {
    const fetchAndPrepareMenuItems = async () => {
      try {
        const userStorageString: string | null = localStorage.getItem('user-storage');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const userStorage: UserDataConfig = JSON.parse(userStorageString as string);
        const { user } = userStorage.state;

        const mounts: DirectoryFile[] = await fetchMountPoints();
        const items = mounts.map((mountPoint) => ({
          id: mountPoint.basename,
          label: mountPoint.filename.includes('teachers') ? 'home' : mountPoint.basename,
          icon: findCorrespondingMountPointIcon(mountPoint),
          action: async () => {
            try {
              await fetchFiles(constructFilePath(mountPoint, user));
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
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciDarkBlue',
  });

  return fileSharingMenuConfig();
};

export default useFileSharingMenuConfig;
