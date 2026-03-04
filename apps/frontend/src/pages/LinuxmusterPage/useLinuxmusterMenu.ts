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
import { faCircleInfo, faDesktop, faGrip, faListCheck, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { LinuxmusterIcon } from '@/assets/icons';
import {
  LINUXMUSTER_INFO_LOCATION,
  LINUXMUSTER_INFO_PATH,
  LINUXMUSTER_PATH,
  PARENT_ASSIGNMENT_LOCATION,
  PARENT_ASSIGNMENT_PATH,
  USER_MANAGEMENT_LOCATION,
  USER_MANAGEMENT_STUDENTS_PATH,
} from '@libs/userManagement/constants/userManagementPaths';
import USER_MANAGEMENT_TABS from '@libs/userManagement/constants/userManagementTabs';
import {
  DEVICE_MANAGEMENT_LOCATION,
  DEVICE_MANAGEMENT_PATH,
} from '@libs/deviceManagement/constants/deviceManagementPaths';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import useOrganizationType from '@/hooks/useOrganizationType';

const useLinuxmusterMenu = (): MenuBarEntry => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSchoolEnvironment, isBusiness } = useOrganizationType();

  const navigateToLinuxmuster = useCallback(() => navigate(`/${LINUXMUSTER_PATH}`), [navigate]);
  const navigateToParentAssignment = useCallback(() => navigate(`/${PARENT_ASSIGNMENT_PATH}`), [navigate]);
  const navigateToInfo = useCallback(() => navigate(`/${LINUXMUSTER_INFO_PATH}`), [navigate]);
  const navigateToUserManagement = useCallback(
    () => navigate(`/${USER_MANAGEMENT_STUDENTS_PATH}/${USER_MANAGEMENT_TABS.TABLE}`),
    [navigate],
  );
  const navigateToDevices = useCallback(() => navigate(`/${DEVICE_MANAGEMENT_PATH}`), [navigate]);

  return useMemo(
    () => ({
      title: isSchoolEnvironment ? 'usermanagement.titleLmn' : 'usermanagement.titleGeneric',
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
          action: navigateToUserManagement,
        },
        {
          id: DEVICE_MANAGEMENT_LOCATION,
          label: 'deviceManagement.menuTitle',
          icon: faDesktop,
          action: navigateToDevices,
        },
        ...(!isBusiness
          ? [
              {
                id: PARENT_ASSIGNMENT_LOCATION,
                label: 'usermanagement.parentAssignment',
                icon: faUserGroup,
                action: navigateToParentAssignment,
              },
            ]
          : []),
        {
          id: LINUXMUSTER_INFO_LOCATION,
          label: 'linuxmuster.versionInfo',
          icon: faCircleInfo,
          action: navigateToInfo,
        },
      ],
    }),
    [
      isSchoolEnvironment,
      isBusiness,
      t,
      navigateToLinuxmuster,
      navigateToUserManagement,
      navigateToDevices,
      navigateToParentAssignment,
      navigateToInfo,
    ],
  );
};

export default useLinuxmusterMenu;
