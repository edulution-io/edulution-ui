/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { FileSharingIcon } from '@/assets/icons';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
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
  const { webdavShares, fetchWebdavShares, shareFirstLevelFolders, fetchShareFirstLevelFolders } =
    useFileSharingStore();
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

  const createFolderChildren = useCallback(
    (shareName: string, sharePath: string): MenuItem[] => {
      const folders = shareFirstLevelFolders[shareName] || [];
      return folders.map((folder) => {
        const folderPath = `${sharePath}${folder.filename}/`;
        return {
          id: `${shareName}-${folder.filename}`,
          label: folder.filename,
          icon: FileSharingIcon,
          action: () => {
            handlePathChange(shareName, folderPath);
          },
          disableTranslation: true,
          isActive: (_pathname: string, searchParams: URLSearchParams) => {
            const currentPath = searchParams.get(URL_SEARCH_PARAMS.PATH) || '';
            return currentPath.startsWith(folderPath);
          },
        };
      });
    },
    [shareFirstLevelFolders, handlePathChange],
  );

  useEffect(() => {
    const menuBarItems: MenuItem[] = webdavShares
      .filter((share) => !share.isRootServer)
      .map((share) => {
        const sharePath = createVariableSharePathname(share.pathname, share.pathVariables);
        const isOnline = share.status === WEBDAV_SHARE_STATUS.UP;
        const children = createFolderChildren(share.displayName, sharePath);

        return {
          id: share.displayName,
          label: share.displayName,
          icon: FileSharingIcon,
          color: 'hover:bg-ciGreenToBlue',
          action: () => {
            if (isOnline) {
              handlePathChange(share.displayName, sharePath);
            } else {
              toast.info(t('webdavShare.offline'), {
                position: 'top-right',
                duration: 1000,
              });
            }
          },
          disableTranslation: true,
          children: children.length > 0 ? children : undefined,
          onExpand: isOnline ? () => fetchShareFirstLevelFolders(share.displayName, sharePath) : undefined,
        };
      });

    const sharedItem: MenuItem = {
      id: SHARED,
      label: t('mountpoints.shared', { defaultValue: 'Geteilte Dateien' }),
      icon: faCloud,
      action: () => navigate(`/${APPS.FILE_SHARING}/${SHARED}`, { replace: true }),
    };

    setMenuItems([...menuBarItems, sharedItem]);
  }, [
    user?.ldapGroups?.roles,
    user?.ldapGroups?.schools,
    webdavShares,
    navigate,
    handlePathChange,
    createFolderChildren,
    fetchShareFirstLevelFolders,
    createVariableSharePathname,
  ]);

  return {
    title: 'filesharing.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.FILE_SHARING,
    menuItems,
  };
};

export default useFileSharingMenuConfig;
