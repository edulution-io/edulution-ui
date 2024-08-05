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

const QuickAccess = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const {
    createProject,
    updateProject,
    removeProject,
    userRoom,
    fetchRoom,
    fetchUserSessions,
    fetchUserProjects,
    fetchUserSchoolClasses,
    userSchoolClasses,
    userProjects,
    isLoading,
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
      isLoading,
      groups: userSchoolClasses.filter((group) => group.member?.find((member) => userRegex.test(member))),
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      createFunction: createProject,
      updateFunction: updateProject,
      removeFunction: removeProject,
      icon: <FaUsersGear className="h-5 w-7" />,
      isLoading,
      groups: userProjects.filter((group) => group.member?.find((member) => userRegex.test(member))),
    },
  ];

  return (
    <div className="max-h-[calc(100vh-70px)] overflow-scroll">
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
