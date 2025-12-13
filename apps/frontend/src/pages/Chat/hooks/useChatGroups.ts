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

import { useEffect, useMemo } from 'react';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLmnApiStore from '@/store/useLmnApiStore';

const useChatGroups = () => {
  const { lmnApiToken, user } = useLmnApiStore();

  const { userProjects, userSchoolClasses, fetchUserProjects, fetchUserSchoolClasses } = useClassManagementStore();

  const userOwnClasses = user?.schoolclasses || [];
  const userOwnProjects = user?.projects || [];

  useEffect(() => {
    if (lmnApiToken) {
      void fetchUserProjects();
      void fetchUserSchoolClasses();
    }
  }, [lmnApiToken, fetchUserProjects, fetchUserSchoolClasses]);

  const filteredSchoolClasses = useMemo(() => {
    if (!userSchoolClasses?.length || !userOwnClasses.length) return [];
    return userSchoolClasses.filter((sc) => userOwnClasses.includes(sc.cn));
  }, [userSchoolClasses, userOwnClasses]);

  const filteredProjects = useMemo(() => {
    if (!userProjects?.length || !userOwnProjects.length) return [];
    return userProjects.filter((p) => userOwnProjects.includes(p.cn));
  }, [userProjects, userOwnProjects]);

  const groupsKey = useMemo(() => {
    if (!filteredSchoolClasses.length && !filteredProjects.length) return null;
    const classIds = filteredSchoolClasses
      .map((sc) => sc.cn)
      .sort()
      .join(',');
    const projectIds = filteredProjects
      .map((p) => p.cn)
      .sort()
      .join(',');
    return `${classIds}|${projectIds}`;
  }, [filteredSchoolClasses, filteredProjects]);

  return {
    schoolClasses: filteredSchoolClasses,
    projects: filteredProjects,
    groupsKey,
    isLoading: !userSchoolClasses || !userProjects,
  };
};

export default useChatGroups;
