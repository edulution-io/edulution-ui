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
import { useSearchParams } from 'react-router-dom';
import useFileManagerActions from '@/api/axios/filemanager/useFileManagerActions.ts';

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
  const { fetchFiles, mountPoints, setMountPoints } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path');
  const { fetchMountPoints } = useFileManagerActions();
  useEffect(() => {
    const fetchAndSetMountPoints = async () => {};

    fetchAndSetMountPoints().catch(console.error);
  }, []);

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
    mountPoints.length === 0 && fetchAndSetMountPoints();
  }, [mountPoints.length]);

  useEffect(() => {
    console.log('mountPoints:', mountPoints);
    if (mountPoints.length === 0) return;
    const items = mountPoints.map((mountPoint) => ({
      id: mountPoint.basename,
      label: mountPoint.filename.includes('teachers') ? 'home' : mountPoint.basename,
      icon: findCorrespondingMountPointIcon(mountPoint),
      action: () => {
        try {
          searchParams.set('path', mountPoint.filename.replace('/webdav', ''));
          setSearchParams(searchParams);
        } catch (error) {
          console.error('Error setting path:', error);
        }
      },
    }));
    setMenuItems(items);
  }, [mountPoints, searchParams, setSearchParams]);

  useEffect(() => {
    if (path) {
      console.log('fetching files', path);
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
