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
  const { fetchMountPoints, fetchFiles, mountPoints, setMountPoints } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path');

  useEffect(() => {
    fetchFiles(path || '/').catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    const fetchAndPrepareMenuItems = async () => {
      try {
        if (mountPoints.length === 0) {
          console.log('fetching mount points');
          const mounts: DirectoryFile[] = await fetchMountPoints();
          setMountPoints(mounts);
        }
        const items = mountPoints.map((mountPoint) => ({
          id: mountPoint.basename,
          label: mountPoint.filename.includes('teachers') ? 'home' : mountPoint.basename,
          icon: findCorrespondingMountPointIcon(mountPoint),
          action: () => {
            try {
              searchParams.set('path', mountPoint.filename.replace('/webdav', ''));
              setSearchParams(searchParams);
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
