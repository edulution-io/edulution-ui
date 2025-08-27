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
  } = useClassManagementStore();

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

  const getGroupsWhereUserIsMember = (
    groups: LmnApiProject[] | LmnApiSchoolClass[],
  ): LmnApiProject[] | LmnApiSchoolClass[] => {
    const isMemberGroups = groups.filter((g) => g.member.some((member) => new RegExp(userRegex.source).test(member)));
    const isAdminGroups = groups.filter((g) => g.sophomorixAdmins.includes(user.cn));

    return Array.from(new Set([...isAdminGroups, ...isMemberGroups])) as LmnApiProject[] | LmnApiSchoolClass[];
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
