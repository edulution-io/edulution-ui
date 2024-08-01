import React, { useEffect } from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import GroupList from '@/pages/ClassManagement/components/GroupList/GroupList';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { FaUsersGear } from 'react-icons/fa6';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const {
    createProject,
    updateProject,
    removeProject,
    userProjects,
    fetchUserProjects,
    fetchUserSchoolClasses,
    isLoading,
  } = useClassManagementStore();

  useEffect(() => {
    void getOwnUser();
    void fetchUserProjects();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      createFunction: createProject,
      updateFunction: updateProject,
      removeFunction: removeProject,
      icon: <FaUsersGear className="h-5 w-7" />,
      groups: userProjects.filter((p) => p.sophomorixAdmins.includes(user.cn)),
    },
  ];

  return (
    <div className="mt-6">
      <LoadingIndicator isOpen={isLoading} />
      {groupRows.map((row) => (
        <div
          key={row.name}
          className="mt-4"
        >
          <h4>{t(`classmanagement.${row.name}`)}</h4>
          <GroupList row={row} />
        </div>
      ))}
    </div>
  );
};

export default ProjectsPage;
