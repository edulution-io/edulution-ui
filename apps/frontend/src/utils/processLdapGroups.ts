import LdapGroups from '@libs/user/types/groups/ldapGroups';

const regexPatterns = {
  school: /^\/SCHOOLS\/s_([^/]+)\/?/,
  studentDetail: /^\/SCHOOLS\/s_[^/]+\/.*students.*\/([^/]+)$/,
  project: /^\/p_([^/]+)/,
  role: /^\/role-(.+)/,
};

const extractMatches = (pattern: RegExp, groups: string[]) =>
  groups.map((group) => group.match(pattern)?.[1]).filter((match) => match) as string[];

const processLdapGroups = (jwtLdapGroups: string[]): LdapGroups => {
  const school = extractMatches(regexPatterns.school, jwtLdapGroups)[0] || '';
  const studentDetails = extractMatches(regexPatterns.studentDetail, jwtLdapGroups);
  const projects = extractMatches(regexPatterns.project, jwtLdapGroups);
  const role = extractMatches(regexPatterns.role, jwtLdapGroups)[0] || '';

  const others = jwtLdapGroups.filter(
    (group) =>
      !regexPatterns.school.test(group) &&
      !regexPatterns.studentDetail.test(group) &&
      !regexPatterns.project.test(group) &&
      !regexPatterns.role.test(group),
  );

  const ldapGroups = {
    school,
    projects,
    projectPaths: projects.map((project) => `/p_${project}`),
    classes: studentDetails,
    classPaths: jwtLdapGroups.filter((group) => regexPatterns.studentDetail.test(group)),
    role,
    others,
  };

  return ldapGroups;
};

export default processLdapGroups;
