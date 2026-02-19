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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import APPS from '@libs/appconfig/constants/apps';
import UserPasswordDialog from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialog';
import UseLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import type UserType from '@libs/userManagement/types/userType';
import USER_TYPE_TO_MANAGEMENT_LIST from '@libs/userManagement/constants/userTypeToManagementList';
import USER_TYPE_TO_ROLE from '@libs/userManagement/constants/userTypeToRole';
import USER_MANAGEMENT_COLUMN_IDS from '@libs/userManagement/constants/userManagementColumnIds';
import useLdapGroups from '@/hooks/useLdapGroups';
import useUserManagementStore from '../../useUserManagementStore';
import getUserTableColumns from './getUserTableColumns';

interface UserTableProps {
  userType: UserType;
}

const UserTable: React.FC<UserTableProps> = ({ userType }) => {
  const { t } = useTranslation();
  const { usersByType, isLoadingUsers, isBackgroundFetchingUsers, fetchUsersByRole, setSelectedUserDetails } =
    useUserManagementStore();
  const users = usersByType[userType] ?? [];
  const { selectedSchool } = useClassManagementStore();
  const { currentUser, setCurrentUser } = UseLmnApiPasswordStore();
  const { isSuperAdmin, isAuthReady } = useLdapGroups();

  useEffect(() => {
    if (!isAuthReady) return;
    if (isSuperAdmin && !selectedSchool) return;
    const role = USER_TYPE_TO_ROLE[userType];
    if (role) {
      const managementList = USER_TYPE_TO_MANAGEMENT_LIST[userType];
      void fetchUsersByRole(userType, role, selectedSchool, managementList ?? undefined);
    }
  }, [userType, selectedSchool, isSuperAdmin, isAuthReady]);

  const columns = useMemo(
    () =>
      getUserTableColumns({
        userType,
        onShowDetails: (user) => setSelectedUserDetails(user),
        setCurrentUser,
      }),
    [userType, setSelectedUserDetails, setCurrentUser],
  );

  return (
    <>
      {isLoadingUsers || isBackgroundFetchingUsers ? <HorizontalLoader /> : <div className="h-1" />}
      <ScrollableTable
        columns={columns}
        data={users}
        filterKey="cn"
        filterPlaceHolderText={t('usermanagement.filterUsers')}
        applicationName={APPS.LINUXMUSTER}
        onRowClick={(user) => setSelectedUserDetails(user)}
        initialSorting={[{ id: USER_MANAGEMENT_COLUMN_IDS.CN, desc: false }]}
      />
      {currentUser && <UserPasswordDialog />}
    </>
  );
};

export default UserTable;
