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
