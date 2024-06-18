import JwtUser from '@/datatypes/jwtUser';
import { JwtUserWithLdapGroups } from '@/datatypes/jwtUserWithLdapGroups';

const regexPatterns = {
  school: /^\/SCHOOLS\/s_([^/]+)\/?/,
  studentDetail: /^\/SCHOOLS\/s_[^/]+\/.*students.*\/([^/]+)$/,
  project: /^\/p_([^/]+)/,
  role: /^\/role-(.+)/,
};

const extractMatches = (pattern: RegExp, groups: string[]) =>
  groups.map((group) => group.match(pattern)?.[1]).filter((match) => match) as string[];

const processLdapGroups = (jwtUser: JwtUser): JwtUserWithLdapGroups => {
  const school = extractMatches(regexPatterns.school, jwtUser.ldapGroups)[0] || '';
  const studentDetails = extractMatches(regexPatterns.studentDetail, jwtUser.ldapGroups);
  const projects = extractMatches(regexPatterns.project, jwtUser.ldapGroups);
  const role = extractMatches(regexPatterns.role, jwtUser.ldapGroups)[0] || '';

  const others = jwtUser.ldapGroups.filter(
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
    classPaths: jwtUser.ldapGroups.filter((group) => regexPatterns.studentDetail.test(group)),
    role,
    others,
  };

  return { ...jwtUser, ldapGroups };
};

export default processLdapGroups;
