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

import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type Section from '@libs/menubar/section';
import {
  USER_MANAGEMENT_EXTRASTUDENTS_LOCATION,
  USER_MANAGEMENT_EXTRASTUDENTS_PATH,
  USER_MANAGEMENT_GLOBALADMINS_LOCATION,
  USER_MANAGEMENT_GLOBALADMINS_PATH,
  USER_MANAGEMENT_PARENTS_LOCATION,
  USER_MANAGEMENT_PARENTS_PATH,
  USER_MANAGEMENT_SCHOOLADMINS_LOCATION,
  USER_MANAGEMENT_SCHOOLADMINS_PATH,
  USER_MANAGEMENT_STAFF_LOCATION,
  USER_MANAGEMENT_STAFF_PATH,
  USER_MANAGEMENT_STUDENTS_LOCATION,
  USER_MANAGEMENT_STUDENTS_PATH,
  USER_MANAGEMENT_TEACHERS_LOCATION,
  USER_MANAGEMENT_TEACHERS_PATH,
} from '@libs/userManagement/constants/userManagementPaths';
import USER_MANAGEMENT_TABS from '@libs/userManagement/constants/userManagementTabs';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useSubMenuStore from '@/store/useSubMenuStore';
import { useTranslation } from 'react-i18next';

const LMN_SPECIFIC_LOCATIONS: string[] = [
  USER_MANAGEMENT_STUDENTS_LOCATION,
  USER_MANAGEMENT_TEACHERS_LOCATION,
  USER_MANAGEMENT_EXTRASTUDENTS_LOCATION,
  USER_MANAGEMENT_PARENTS_LOCATION,
  USER_MANAGEMENT_SCHOOLADMINS_LOCATION,
];

const useRegisterUserManagementSections = () => {
  const navigate = useNavigate();
  const { isLmn } = useDeploymentTarget();
  const { setSections } = useSubMenuStore();
  const { t } = useTranslation();

  const allSections: Section[] = useMemo(
    () => [
      {
        id: USER_MANAGEMENT_STUDENTS_LOCATION,
        label: t('usermanagement.students'),
        action: () => navigate(`/${USER_MANAGEMENT_STUDENTS_PATH}/${USER_MANAGEMENT_TABS.TABLE}`),
      },
      {
        id: USER_MANAGEMENT_TEACHERS_LOCATION,
        label: t('usermanagement.teachers'),
        action: () => navigate(`/${USER_MANAGEMENT_TEACHERS_PATH}/${USER_MANAGEMENT_TABS.TABLE}`),
      },
      {
        id: USER_MANAGEMENT_EXTRASTUDENTS_LOCATION,
        label: t('usermanagement.extrastudents'),
        action: () => navigate(`/${USER_MANAGEMENT_EXTRASTUDENTS_PATH}/${USER_MANAGEMENT_TABS.TABLE}`),
      },
      {
        id: USER_MANAGEMENT_PARENTS_LOCATION,
        label: t('usermanagement.parents'),
        action: () => navigate(`/${USER_MANAGEMENT_PARENTS_PATH}/${USER_MANAGEMENT_TABS.TABLE}`),
      },
      {
        id: USER_MANAGEMENT_STAFF_LOCATION,
        label: t('usermanagement.staff'),
        action: () => navigate(`/${USER_MANAGEMENT_STAFF_PATH}/${USER_MANAGEMENT_TABS.TABLE}`),
      },
      {
        id: USER_MANAGEMENT_SCHOOLADMINS_LOCATION,
        label: t('usermanagement.schooladmins'),
        action: () => navigate(`/${USER_MANAGEMENT_SCHOOLADMINS_PATH}/${USER_MANAGEMENT_TABS.SCHOOLADMINS}`),
      },
      {
        id: USER_MANAGEMENT_GLOBALADMINS_LOCATION,
        label: t('usermanagement.globaladmins'),
        action: () => navigate(`/${USER_MANAGEMENT_GLOBALADMINS_PATH}/${USER_MANAGEMENT_TABS.GLOBALADMINS}`),
      },
    ],
    [navigate, t],
  );

  const visibleSections = useMemo(
    () => (isLmn ? allSections : allSections.filter((s) => !LMN_SPECIFIC_LOCATIONS.includes(s.id))),
    [isLmn, allSections],
  );

  useEffect(() => {
    setSections(visibleSections);
    return () => setSections([]);
  }, [visibleSections, setSections]);
};

export default useRegisterUserManagementSections;
