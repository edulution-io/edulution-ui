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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { CloudIcon, FileSharingIcon } from '@/assets/icons';
import userStore from '@/store/UserStore/useUserStore';
import MenuItem from '@libs/menubar/menuItem';
import APPS from '@libs/appconfig/constants/apps';
import { t } from 'i18next';
import SHARED from '@libs/filesharing/constants/shared';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import { toast } from 'sonner';
import useVariableSharePathname from './hooks/useVariableSharePathname';

const useFileSharingMenuConfig = () => {
  const { pathname } = useLocation();
  const { webdavShares, fetchWebdavShares } = useFileSharingStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const { user } = userStore();
  const { createVariableSharePathname } = useVariableSharePathname();

  const handlePathChange = useCallback(
    (shareDisplayName: string, sharePathname: string) => {
      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${shareDisplayName}`,
          search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(sharePathname)}`,
        },
        { replace: true },
      );
    },
    [navigate],
  );

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const firstPathPart = pathParts[0] || '';
  const previousFirstPathPart = useRef<string | null>(null);

  useEffect(() => {
    if (firstPathPart !== previousFirstPathPart.current) {
      previousFirstPathPart.current = firstPathPart;

      if (firstPathPart === APPS.FILE_SHARING) {
        void fetchWebdavShares();
      }
    }
  }, [firstPathPart]);

  useEffect(() => {
    if (!webdavShares.length) return;

    const menuBarItems: MenuItem[] = webdavShares
      .filter((share) => !share.isRootServer)
      .map((share) => ({
        id: share.displayName,
        label: share.displayName,
        icon: FileSharingIcon,
        color: 'hover:bg-ciGreenToBlue',
        action: () => {
          if (share.status === WEBDAV_SHARE_STATUS.UP) {
            handlePathChange(share.displayName, createVariableSharePathname(share.pathname, share.pathVariables));
          } else {
            toast.info(t('webdavShare.offline'), {
              position: 'top-right',
              duration: 1000,
            });
          }
        },
        disableTranslation: true,
      }));

    const sharedItem: MenuItem = {
      id: SHARED,
      label: t('mountpoints.shared', { defaultValue: 'Geteilte Dateien' }),
      icon: CloudIcon,
      action: () => navigate(`/${APPS.FILE_SHARING}/${SHARED}`, { replace: true }),
    };

    setMenuItems([...menuBarItems, sharedItem]);
  }, [user?.ldapGroups?.roles, user?.ldapGroups?.schools, webdavShares, navigate, handlePathChange]);

  return {
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.FILE_SHARING,
    menuItems,
  };
};

export default useFileSharingMenuConfig;
