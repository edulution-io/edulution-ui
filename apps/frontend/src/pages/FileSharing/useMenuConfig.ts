/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import {
  CloudIcon,
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
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import MenuItem from '@libs/menubar/menuItem';
import APPS from '@libs/appconfig/constants/apps';
import { t } from 'i18next';

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
  const { mountPoints } = useFileSharingStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = userStore();

  const handlePathChange = useCallback(
    (newPath: string, basePath: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      navigate(`filesharing/${basePath}`);
      newSearchParams.set('path', newPath);
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const menuBarItems: MenuItem[] = mountPoints.map((mountPoint: DirectoryFileDTO) => {
      const isHome =
        mountPoint.filePath.includes(`${user?.ldapGroups?.roles?.at(0)}s`) &&
        mountPoint.filePath.includes(`${user?.username}`);
      let translationKey = `mountpoints.${mountPoint.filename?.toLowerCase()}`;

      if (isHome) {
        translationKey = 'mountpoints.home';
      }
      const baseName = mountPoint.filename ?? '';

      const defaultLabel = baseName ? baseName.charAt(0).toUpperCase() + baseName.slice(1) : '';

      const label = t(translationKey, { defaultValue: defaultLabel });

      return {
        id: mountPoint.filename,
        label,
        icon: findCorrespondingMountPointIcon(mountPoint.filePath),
        color: 'hover:bg-ciGreenToBlue',
        action: () => handlePathChange(getPathWithoutWebdav(mountPoint.filePath), mountPoint.filename),
      };
    });

    const sharedItem: MenuItem = {
      id: 'shared',
      label: t('mountpoints.shared', { defaultValue: 'Geteilte Dateien' }),
      icon: CloudIcon,
      action: () => handlePathChange('/shared', 'shared'),
    };

    setMenuItems([...menuBarItems, sharedItem]);
  }, [mountPoints, user?.ldapGroups?.roles, user?.ldapGroups?.schools, searchParams, setSearchParams, t]);

  return {
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.FILE_SHARING,
    menuItems,
  };
};

export default useFileSharingMenuConfig;
