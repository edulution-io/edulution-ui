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

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faCircleInfo, faGrip, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { LinuxmusterIcon } from '@/assets/icons';
import {
  LINUXMUSTER_INFO_LOCATION,
  LINUXMUSTER_INFO_PATH,
  LINUXMUSTER_PATH,
  USER_MANAGEMENT_LOCATION,
} from '@libs/userManagement/constants/userManagementPaths';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';

const useLinuxmusterMenu = (): MenuBarEntry => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLmn } = useDeploymentTarget();

  const navigateToLinuxmuster = useCallback(() => navigate(`/${LINUXMUSTER_PATH}`), [navigate]);
  const navigateToInfo = useCallback(() => navigate(`/${LINUXMUSTER_INFO_PATH}`), [navigate]);

  return useMemo(
    () => ({
      title: isLmn ? 'usermanagement.titleLmn' : 'usermanagement.titleGeneric',
      appName: APPS.LINUXMUSTER,
      icon: LinuxmusterIcon,
      color: 'hover:bg-ciGreenToBlue',
      menuItems: [
        {
          id: LINUXMUSTER_PATH,
          label: 'common.overview',
          icon: faGrip,
          action: navigateToLinuxmuster,
        },
        {
          id: USER_MANAGEMENT_LOCATION,
          label: 'usermanagement.menuTitle',
          icon: faListCheck,
          action: navigateToLinuxmuster,
        },
        {
          id: LINUXMUSTER_INFO_LOCATION,
          label: 'linuxmuster.versionInfo',
          icon: faCircleInfo,
          action: navigateToInfo,
        },
      ],
    }),
    [isLmn, t, navigateToLinuxmuster, navigateToInfo],
  );
};

export default useLinuxmusterMenu;
