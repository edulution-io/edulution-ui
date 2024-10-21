import React, { useEffect, useRef, useState } from 'react';
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
import useScroll from '@/hooks/useScroll';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolled = useScroll(scrollContainerRef);

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

  return (
    <div
      className="mt-2 max-h-[calc(100vh-50px)] overflow-y-auto scrollbar-thin"
      ref={scrollContainerRef}
    >
      <div className={`sticky top-0 z-10 ${isScrolled ? ' bg-ciDarkGrey pb-1' : ''}`}>
        <Input
          name="filter"
          onChange={(e) => setFilterKeyWord(e.target.value)}
          placeholder={t('classmanagement.typeToFilter')}
          variant="lightGray"
        />
      </div>
      <div className="mt-2 text-lg">{t('classmanagement.projectsPageDescription')}</div>
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
      <ProjectsFloatingButtonsBar />
    </div>
  );
};

export default ProjectsPage;
