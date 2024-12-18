import React, { useEffect } from 'react';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupsColumn from '@/pages/ClassManagement/LessonPage/QuickAccess/GroupsColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import GroupColumn from '@libs/groups/types/groupColumn';
import { MdGroups } from 'react-icons/md';
import { FaUsersGear } from 'react-icons/fa6';
import useLmnApiStore from '@/store/useLmnApiStore';
import CircleLoader from '@/components/ui/CircleLoader';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { useTranslation } from 'react-i18next';
import { LuMonitor } from 'react-icons/lu';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

const QuickAccess = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
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
    void getOwnUser();
    void fetchRoom();
    void fetchUserSessions();
    void fetchUserProjects();
    void fetchUserSchoolClasses();
  }, []);

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
    <div className="max-h-[calc(100vh-70px)] overflow-y-auto scrollbar-thin ">
      <h3 className="mt-2 text-center">{t('quickAccess')}</h3>
      <div className="my-4 flex flex-wrap">
        {groupColumns.map((item) => (
          <div
            key={item.name}
            className="mb-8 w-full px-5 md:w-1/3"
          >
            <GroupsColumn column={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
