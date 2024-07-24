import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
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
import userStore from '@/store/UserStore/UserStore';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import { DirectoryFileDTO } from '@libs/filesharing/DirectoryFileDTO';

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
  const { mountPoints, fetchMountPoints } = useFileSharingStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = userStore();

  useEffect(() => {
    void fetchMountPoints();
  }, [user?.username]);

  const handlePathChange = useCallback(
    (newPath: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('path', newPath);
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const items: MenuItem[] = mountPoints
      .map((mountPoint: DirectoryFileDTO) => ({
        id: mountPoint.basename,
        label: mountPoint.basename,
        icon: findCorrespondingMountPointIcon(mountPoint.filename),
        color: 'hover:bg-ciGreenToBlue',
        action: () => handlePathChange(getPathWithoutWebdav(mountPoint.filename)),
      }))
      .filter((item) => item !== null);
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
