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
import { CloudIcon, FileSharingIcon } from '@/assets/icons';
import userStore from '@/store/UserStore/useUserStore';
import MenuItem from '@libs/menubar/menuItem';
import APPS from '@libs/appconfig/constants/apps';
import { t } from 'i18next';
import SHARED from '@libs/filesharing/constants/shared';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';

const useFileSharingMenuConfig = () => {
  const { webdavShares } = useFileSharingStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = userStore();

  const handlePathChange = useCallback(
    (basePath: string) => {
      navigate(
        {
          pathname: `${APPS.FILE_SHARING}/${basePath}`,
          search: '',
        },
        { replace: true },
      );
    },
    [navigate],
  );

  useEffect(() => {
    const menuBarItems: MenuItem[] = webdavShares
      .filter((share) => !!share.webdavShareId)
      .map((share) => ({
        id: share.webdavShareId!,
        label: share.displayName,
        icon: FileSharingIcon,
        color: 'hover:bg-ciGreenToBlue',
        action: () => (share.status === WEBDAV_SHARE_STATUS.UP ? handlePathChange(share.displayName) : {}),
        disableTranslation: true,
      }));

    const sharedItem: MenuItem = {
      id: 'shared',
      label: t('mountpoints.shared', { defaultValue: 'Geteilte Dateien' }),
      icon: CloudIcon,
      action: () => handlePathChange(SHARED),
    };

    setMenuItems([...menuBarItems, sharedItem]);
  }, [user?.ldapGroups?.roles, user?.ldapGroups?.schools, searchParams, setSearchParams, t]);

  return {
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.FILE_SHARING,
    menuItems,
  };
};

export default useFileSharingMenuConfig;
