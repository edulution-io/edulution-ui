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

import React, { useEffect } from 'react';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupsColumn from '@/pages/ClassManagement/LessonPage/QuickAccess/GroupsColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import GroupColumn from '@libs/groups/types/groupColumn';
import { MdGroups } from 'react-icons/md';
import { FaUsersGear } from 'react-icons/fa6';
import useLmnApiStore from '@/store/useLmnApiStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { useTranslation } from 'react-i18next';
import { LuMonitor } from 'react-icons/lu';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import useLdapGroups from '@/hooks/useLdapGroups';

const QuickAccess = () => {
  const { t } = useTranslation();
  const { user, lmnApiToken } = useLmnApiStore();
  const {
    createProject,
    updateProject,
    deleteProject,
    userRoom,
    fetchRoom,
    fetchUserSessions,
    fetchUserProjects,
    fetchUserSchoolClasses,
    userSchoolClasses,
    userProjects,
    areProjectsLoading,
    areSchoolClassesLoading,
    isRoomLoading,
    selectedSchool,
  } = useClassManagementStore();
  const { isSuperAdmin } = useLdapGroups();

  useEffect(() => {
    if (lmnApiToken) {
      void fetchRoom();
      void fetchUserSessions(false);
      void fetchUserProjects();
      void fetchUserSchoolClasses();
    }
  }, [lmnApiToken]);

  if (!user) {
    return <CircleLoader />;
  }

  const userRegex = getUserRegex(user.cn);

  const getGroupsWhereUserIsMember = <T extends LmnApiProject | LmnApiSchoolClass>(groups: T[]) => {
    const isMemberGroups = groups.filter(
      (g) =>
        (!isSuperAdmin || g.sophomorixSchoolname === selectedSchool) &&
        g.member.some((member) => new RegExp(userRegex.source).test(member)),
    );

    const isAdminGroups = groups.filter(
      (g) => (!isSuperAdmin || g.sophomorixSchoolname === selectedSchool) && g.sophomorixAdmins.includes(user.cn),
    );

    return Array.from(new Set([...isAdminGroups, ...isMemberGroups]));
  };

  const groupColumns: GroupColumn[] = [
    {
      name: UserGroups.Room,
      translationId: 'myRoom',
      createFunction: undefined,
      icon: <LuMonitor className="h-7 w-7" />,
      isLoading: isRoomLoading,
      groups: userRoom
        ? [
            {
              ...userRoom,
              sid: userRoom?.name,
              member: userRoom.usersList,
              membersCount: userRoom.usersList.length,
            } as unknown as LmnApiSchoolClass,
          ]
        : [],
    },
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      createFunction: undefined,
      icon: <MdGroups className="h-7 w-7" />,
      isLoading: areSchoolClassesLoading,
      groups: getGroupsWhereUserIsMember(userSchoolClasses),
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      createFunction: createProject,
      updateFunction: updateProject,
      removeFunction: deleteProject,
      icon: <FaUsersGear className="h-7 w-7" />,
      isLoading: areProjectsLoading,
      groups: getGroupsWhereUserIsMember(userProjects),
    },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <h3 className="mt-2 text-center text-background">{t('quickAccess')}</h3>
      <div className="my-4 flex flex-wrap">
        {groupColumns.map((item) => (
          <div
            key={item.name}
            className="mb-8 w-full min-w-48 px-5 text-background md:w-1/3"
          >
            <GroupsColumn column={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
