import { useEffect, useState } from 'react';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
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
import { useSearchParams } from 'react-router-dom';
import userStore from '@/store/userStore';

const findCorrespondingMountPointIcon = (mount: DirectoryFile) => {
  if (mount.filename.includes('teachers')) {
    return TeacherIcon;
  }
  if (mount.filename.includes('projects')) {
    return ProjectIcon;
  }
  if (mount.filename.includes('iso')) {
    return IsoIcon;
  }
  if (mount.filename.includes('programs')) {
    return ProgrammIcon;
  }
  if (mount.filename.includes('share')) {
    return ShareIcon;
  }
  if (mount.filename.includes('students')) {
    return StudentsIcon;
  }
  return FileSharingIcon;
};

const useFileSharingMenuConfig = () => {
  const { fetchFiles, mountPoints, setMountPoints, fetchMountPoints } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { userInfo } = userStore();
  const path = searchParams.get('path');

  useEffect(() => {
    const fetchAndSetMountPoints = async () => {
      try {
        const mounts = await fetchMountPoints();
        if (Array.isArray(mounts)) {
          setMountPoints(mounts);
        }
      } catch (error) {
        console.error('Error fetching mount points:', error);
      }
    };
    if (mountPoints.length === 0) fetchAndSetMountPoints();
  }, [mountPoints.length, fetchMountPoints, setMountPoints]);

  useEffect(() => {
    if (mountPoints.length === 0) return;

    const items = mountPoints.map((mountPoint) => {
      const isHomePoint = mountPoint.filename.includes(`${userInfo?.ldapGroups?.role}s`);
      return {
        id: mountPoint.basename,
        label: isHomePoint ? 'home' : mountPoint.basename,
        icon: findCorrespondingMountPointIcon(mountPoint),
        action: () => {
          try {
            let newPath = mountPoint.filename.replace('/webdav', '');
            if (isHomePoint) {
              newPath = mountPoint.filename.replace(`/webdav/server/${userInfo?.ldapGroups?.school}/`, '');
            }
            searchParams.set('path', newPath);
            setSearchParams(searchParams);
          } catch (error) {
            console.error('Error setting path:', error);
          }
        },
      };
    });
    setMenuItems(items);
  }, [mountPoints, userInfo?.ldapGroups?.role, userInfo?.ldapGroups?.school, searchParams, setSearchParams]);

  useEffect(() => {
    if (path) {
      fetchFiles(path).catch(console.error);
    }
  }, [path, fetchFiles]);

  const fileSharingMenuConfig = (): MenuBarEntryProps => ({
    menuItems,
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciDarkBlue',
  });

  return fileSharingMenuConfig();
};

export default useFileSharingMenuConfig;
