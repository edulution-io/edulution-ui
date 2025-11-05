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

import LdapGroups from '@libs/groups/types/ldapGroups';
import PROJECTS_PREFIX from '@libs/lmnApi/constants/prefixes/projectsPrefix';

const regexPatterns = {
  school: /^\/SCHOOLS\/s_([^/]+)\/?/,
  class: /^\/SCHOOLS\/s_[^/]+\/.*students.*\/([^/]+)$/,
  project: new RegExp(`^${PROJECTS_PREFIX}([^/]+)`),
  role: /^\/role-(.+)/,
};

const extractMatches = (pattern: RegExp, groups: string[]) =>
  groups.map((group) => group.match(pattern)?.[1]).filter((match): match is string => !!match);

const processLdapGroups = (jwtLdapGroups: string[]): LdapGroups => {
  const schools = extractMatches(regexPatterns.school, jwtLdapGroups);
  const classes = extractMatches(regexPatterns.class, jwtLdapGroups);
  const projects = extractMatches(regexPatterns.project, jwtLdapGroups);
  const roles = extractMatches(regexPatterns.role, jwtLdapGroups);

  const others = jwtLdapGroups.filter(
    (group) =>
      !regexPatterns.school.test(group) &&
      !regexPatterns.class.test(group) &&
      !regexPatterns.project.test(group) &&
      !regexPatterns.role.test(group),
  );

  return {
    schools: [...new Set(schools)],
    projects,
    projectPaths: projects.map((project) => `${PROJECTS_PREFIX}${project}`),
    classes,
    classPaths: jwtLdapGroups.filter((group) => regexPatterns.class.test(group)),
    roles: [...new Set(roles)],
    others,
  };
};

export default processLdapGroups;
