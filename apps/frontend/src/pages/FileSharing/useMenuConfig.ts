import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFileManagerStore from '@/pages/FileSharing/FileManagerStore';
import { MenuItem } from '@/datatypes/types';
import {
  FileSharingIcon,
  IsoIcon,
  ProgrammIcon,
  ProjectIcon,
  ShareIcon,
  StudentsIcon,
  TeacherIcon,
} from '@/assets/icons';

const iconMap = {
  teachers: TeacherIcon,
  projects: ProjectIcon,
  iso: IsoIcon,
  programs: ProgrammIcon,
  share: ShareIcon,
  students: StudentsIcon,
};

const findCorrespondingMountPointIcon = (filename: string) => {
  const key = Object.keys(iconMap).find((k) => filename.includes(k));
  return key ? iconMap[key as keyof typeof iconMap] : FileSharingIcon;
};

const useFileSharingMenuConfig = () => {
  const { mountPoints, setMountPoints, fetchMountPoints } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchAndSetMountPoints = useCallback(async () => {
    if (mountPoints.length === 0) {
      try {
        const mounts = await fetchMountPoints();
        if (Array.isArray(mounts)) {
          setMountPoints(mounts);
        }
      } catch (error) {
        console.error('Error fetching mount points:', error);
      }
    }
  }, [mountPoints.length, fetchMountPoints, setMountPoints]);

  useEffect(() => {
    const asyncSetMountPoints = async () => {
      await fetchAndSetMountPoints();
    };
    asyncSetMountPoints().catch((error) => {
      console.error(error);
    });
  }, [fetchAndSetMountPoints]);

  const handlePathChange = useCallback(
    (newPath: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('path', newPath);
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const items = mountPoints.map((mountPoint) => ({
      id: mountPoint.basename,
      label: mountPoint.basename,
      icon: findCorrespondingMountPointIcon(mountPoint.filename),
      color: 'hover:bg-ciGreenToBlue',
      action: () => handlePathChange(mountPoint.filename.replace('/webdav', '')),
    }));
    setMenuItems(items);
  }, [mountPoints]);

  return {
    menuItems,
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciGreenToBlue',
  };
};

export default useFileSharingMenuConfig;
