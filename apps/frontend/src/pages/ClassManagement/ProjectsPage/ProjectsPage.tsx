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

import React, { useEffect, useState } from 'react';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
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
import PageLayout from '@/components/structure/layout/PageLayout';
import useLdapGroups from '@/hooks/useLdapGroups';
import SchoolSelectorDropdown from '../components/SchoolSelectorDropdown';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { getOwnUser, user, lmnApiToken } = useLmnApiStore();
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
  const { isSuperAdmin } = useLdapGroups();

  useEffect(() => {
    if (lmnApiToken) {
      void getOwnUser();
      void fetchUserProjects();
      void fetchUserSchoolClasses();
    }
  }, [lmnApiToken]);

  const filterProjects = (project: LmnApiProject) =>
    project.sophomorixAdmins.includes(user?.cn || '') &&
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
    <PageLayout>
      <div className="mb-2 flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="min-w-0 flex-1">
          <Input
            className="h-10 w-full"
            name="filter"
            onChange={(e) => setFilterKeyWord(e.target.value)}
            placeholder={t('classmanagement.typeToFilter')}
          />
        </div>

        {isSuperAdmin && <SchoolSelectorDropdown />}
      </div>

      <div className="flex max-h-full max-w-full flex-row flex-wrap overflow-y-auto scrollbar-thin">
        <p className="mt-2 min-w-full">{t('classmanagement.projectsPageDescription')}</p>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4 min-w-full"
          >
            <h4 className="text-background">{t(`classmanagement.${row.name}`)}</h4>
            <GroupList row={row} />
          </div>
        ))}
      </div>
      <ProjectsFloatingButtonsBar />
      <LoadingIndicatorDialog isOpen={isLoading} />
    </PageLayout>
  );
};

export default ProjectsPage;
