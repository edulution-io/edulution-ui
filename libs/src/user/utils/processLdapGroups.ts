import LdapGroups from '@libs/groups/types/ldapGroups';

const regexPatterns = {
  school: /^\/SCHOOLS\/s_([^/]+)\/?/,
  class: /^\/SCHOOLS\/s_[^/]+\/.*students.*\/([^/]+)$/,
  project: /^\/p_([^/]+)/,
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
    projectPaths: projects.map((project) => `/p_${project}`),
    classes,
    classPaths: jwtLdapGroups.filter((group) => regexPatterns.class.test(group)),
    roles: [...new Set(roles)],
    others,
  };
};

export default processLdapGroups;
