import React, { useEffect, useState } from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import GroupList from '@/pages/ClassManagement/components/GroupList/GroupList';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { FaUsersGear } from 'react-icons/fa6';
import ProjectsFloatingButtonsBar from '@/pages/ClassManagement/ProjectsPage/ProjectsFloatingButtonsBar';
import Input from '@/components/shared/Input';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import useElementHeight from '@/hooks/useElementHeight';
import { FILTER_BAR_ID } from '@libs/classManagement/constants/pageElementIds';

import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const {
    createProject,
    updateProject,
    deleteProject,
    userProjects,
    fetchUserProjects,
    fetchUserSchoolClasses,
    isLoading,
  } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');

  useEffect(() => {
    void getOwnUser();
    void fetchUserProjects();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

  const filterProjects = (project: LmnApiProject) =>
    project.sophomorixAdmins.includes(user.cn) &&
    (project.cn.includes(filterKeyWord) || project.displayName.includes(filterKeyWord));

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      createFunction: createProject,
      updateFunction: updateProject,
      removeFunction: deleteProject,
      icon: <FaUsersGear className="h-5 w-7" />,
      groups: userProjects.filter(filterProjects),
    },
  ];

  const pageBarsHeight = useElementHeight([FLOATING_BUTTONS_BAR_ID, FILTER_BAR_ID, FOOTER_ID]) + 10;

  return (
    <>
      <Input
        name="filter"
        onChange={(e) => setFilterKeyWord(e.target.value)}
        placeholder={t('classmanagement.typeToFilter')}
        variant="lightGray"
        id={FILTER_BAR_ID}
        className="my-2"
      />
      <div
        className="flex max-w-full flex-row flex-wrap overflow-y-auto overflow-x-visible scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <div className="mt-2 min-w-full text-lg">{t('classmanagement.projectsPageDescription')}</div>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4 min-w-full"
          >
            <h4>{t(`classmanagement.${row.name}`)}</h4>
            <GroupList row={row} />
          </div>
        ))}
      </div>
      <ProjectsFloatingButtonsBar />
      <LoadingIndicator isOpen={isLoading} />
    </>
  );
};

export default ProjectsPage;
