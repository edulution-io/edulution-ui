import React, { useEffect } from 'react';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupsColumn from '@/pages/ClassManagement/components/GroupsColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import GroupColumn from '@libs/groups/types/groupColumn';
import { MdGroups } from 'react-icons/md';
import { FaAddressCard } from 'react-icons/fa';
import { FaUsersGear } from 'react-icons/fa6';
import useLmnApiStore from '@/store/lmnApiStore';
import CircleLoader from '@/components/ui/CircleLoader';

const FavoriteGroups = () => {
  const { getOwnUser, user } = useLmnApiStore();
  const {
    createProject,
    createSession,
    fetchUserSessions,
    fetchUserProjects,
    fetchUserSchoolClasses,
    userSessions,
    userSchoolClasses,
    userProjects,
  } = useClassManagementStore();

  useEffect(() => {
    void getOwnUser();
    void fetchUserSessions();
    void fetchUserProjects();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return <CircleLoader />;
  }

  const groupColumns: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      createFunction: undefined,
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses,
    },
    {
      name: UserGroups.Sessions,
      translationId: 'mySessions',
      createFunction: createSession,
      icon: <FaAddressCard className="h-6 w-6" />,
      groups: userSessions,
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      createFunction: createProject,
      icon: <FaUsersGear className="h-7 w-7" />,
      groups: userProjects,
    },
  ];

  return (
    <>
      <div className="my-4 flex flex-wrap">
        {groupColumns.map((item) => (
          <div
            key={item.name}
            className="w-full px-5 md:w-1/3"
          >
            <GroupsColumn column={item} />
          </div>
        ))}
      </div>
    </>
  );
};

export default FavoriteGroups;
