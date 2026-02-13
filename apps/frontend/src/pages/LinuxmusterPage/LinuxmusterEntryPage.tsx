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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChalkboardTeacher,
  faGlobe,
  faUserGraduate,
  faUserPlus,
  faUsers,
  faUserShield,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import { Card, CardContent } from '@/components/shared/Card';
import {
  USER_MANAGEMENT_EXTRASTUDENTS_PATH,
  USER_MANAGEMENT_GLOBALADMINS_PATH,
  USER_MANAGEMENT_PARENTS_PATH,
  USER_MANAGEMENT_SCHOOLADMINS_PATH,
  USER_MANAGEMENT_STAFF_PATH,
  USER_MANAGEMENT_STUDENTS_PATH,
  USER_MANAGEMENT_TEACHERS_PATH,
} from '@libs/userManagement/constants/userManagementPaths';
import USER_MANAGEMENT_TABS from '@libs/userManagement/constants/userManagementTabs';
import type UserTypeCard from '@libs/userManagement/types/userTypeCard';
import { LinuxmusterIcon } from '@/assets/icons';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useRegisterUserManagementSections from './UserManagement/useRegisterUserManagementSections';

const USER_TYPE_CARDS: UserTypeCard[] = [
  {
    labelKey: 'usermanagement.students',
    icon: faUserGraduate,
    path: USER_MANAGEMENT_STUDENTS_PATH,
    defaultTab: USER_MANAGEMENT_TABS.TABLE,
    lmnOnly: true,
  },
  {
    labelKey: 'usermanagement.teachers',
    icon: faChalkboardTeacher,
    path: USER_MANAGEMENT_TEACHERS_PATH,
    defaultTab: USER_MANAGEMENT_TABS.TABLE,
    lmnOnly: true,
  },
  {
    labelKey: 'usermanagement.extrastudents',
    icon: faUserPlus,
    path: USER_MANAGEMENT_EXTRASTUDENTS_PATH,
    defaultTab: USER_MANAGEMENT_TABS.TABLE,
    lmnOnly: true,
  },
  {
    labelKey: 'usermanagement.parents',
    icon: faUsers,
    path: USER_MANAGEMENT_PARENTS_PATH,
    defaultTab: USER_MANAGEMENT_TABS.TABLE,
    lmnOnly: true,
  },
  {
    labelKey: 'usermanagement.staff',
    icon: faUserTie,
    path: USER_MANAGEMENT_STAFF_PATH,
    defaultTab: USER_MANAGEMENT_TABS.TABLE,
    lmnOnly: false,
  },
  {
    labelKey: 'usermanagement.schooladmins',
    icon: faUserShield,
    path: USER_MANAGEMENT_SCHOOLADMINS_PATH,
    defaultTab: USER_MANAGEMENT_TABS.SCHOOLADMINS,
    lmnOnly: true,
  },
  {
    labelKey: 'usermanagement.globaladmins',
    icon: faGlobe,
    path: USER_MANAGEMENT_GLOBALADMINS_PATH,
    defaultTab: USER_MANAGEMENT_TABS.GLOBALADMINS,
    lmnOnly: false,
  },
];

const LinuxmusterEntryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLmn } = useDeploymentTarget();

  useRegisterUserManagementSections();

  const visibleCards = isLmn ? USER_TYPE_CARDS : USER_TYPE_CARDS.filter((card) => !card.lmnOnly);

  const nativeAppHeader = {
    title: t(isLmn ? 'linuxmuster.sidebarLmn' : 'linuxmuster.sidebarGeneric'),
    description: t('linuxmuster.description'),
    iconSrc: LinuxmusterIcon,
  };

  return (
    <PageLayout nativeAppHeader={nativeAppHeader}>
      <div className="p-4">
        <h2 className="mb-4 text-xl font-semibold">{t('linuxmuster.userManagement')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <Card
              key={card.labelKey}
              variant="grid"
              onClick={() => navigate(`/${card.path}/${card.defaultTab}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/${card.path}/${card.defaultTab}`);
              }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <FontAwesomeIcon
                  icon={card.icon}
                  className="h-8 w-8 text-ciLightBlue"
                />
                <span className="text-lg font-medium">{t(card.labelKey)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default LinuxmusterEntryPage;
