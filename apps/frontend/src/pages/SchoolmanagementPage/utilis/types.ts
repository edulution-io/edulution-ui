import { MemberInfo } from '@/datatypes/schoolclassInfo.ts';
import { SessionInfo } from '@/datatypes/sessionInfo.ts';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes.ts';

export interface UserInitialPasswordInfo {
  username: string;
  firstPassword: string;
  firstPasswordStillSet: boolean;
}

export interface Access {
  view: boolean;
  viewMembers: boolean;
  manageMembers: boolean;
  manage: boolean;
  manageMembership: boolean;
}

export interface BaseGroup {
  id: string;
  name: string;
  path: string;
  subGroupCount: number;
  subGroups: SubGroup[];
  access: Access;
}

export interface SubGroup extends BaseGroup {
  parentId: string;
}

export interface Printer extends BaseGroup {}
export interface Class extends BaseGroup {}
export interface Project extends BaseGroup {}

export interface School {
  id: string;
  name: string;
  path: string;
  printers: Printer[];
  classes: Class[];
  projects: Project[];
  access: Access;
}

export interface GroupsData {
  schools: School[];
}

export interface OriginalIdTokenClaims {
  aud: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  ldapGroups: string[];
  name: string;
  preferred_username: string;
  session_state: string;
  sid: string;
  sub: string;
  typ: string;
}

export interface CustomIdTokenClaims extends Omit<OriginalIdTokenClaims, 'ldapGroups'> {
  ldapGroups: {
    school: string;
    projects: string[];
    projectPaths: string[];
    classes: string[];
    classPaths: string[];
    role: string;
    others: string[];
  };
}

export interface GroupCardRowProps {
  schoolclasses?: Record<string, MemberInfo>;
  sessions?: SessionInfo[];
  projects?: Record<string, MemberInfo>;
  setIsCreateDialogOpen?: (isOpen: boolean) => void;
  isCreateDialogOpen?: boolean;
  setDialogTitle?: (title: string) => void;
  setCreateContentType?: (type: CreateContentTypes) => void;
  isAdmin: boolean;
  deleteSession?: (sid: string) => Promise<void>;
}

export const processIdTokenClaims = (claims: OriginalIdTokenClaims): CustomIdTokenClaims => {
  const schoolRegex = /^\/SCHOOLS\/s_([^/]+)\/?/;
  const studentDetailRegex = /^\/SCHOOLS\/s_[^/]+\/.*students.*\/([^/]+)$/;
  const projectRegex = /^\/p_([^/]+)/;
  const roleRegex = /^\/role-(.+)/;

  const schoolMatch = claims.ldapGroups.find((group) => schoolRegex.test(group));
  const school = schoolMatch ? schoolMatch.match(schoolRegex)?.[1] || '' : '';

  const studentDetailMatches = claims.ldapGroups.filter((group) => studentDetailRegex.test(group));
  const studentDetails = studentDetailMatches.map((group) => {
    const match = group.match(studentDetailRegex);
    return match ? match[1] : '';
  });
  const studentDetailPaths = studentDetailMatches;

  const projects = claims.ldapGroups
    .filter((group) => projectRegex.test(group))
    .map((group) => group.match(projectRegex)?.[1] || '');
  const projectPaths = projects.map((project) => `/p_${project}`);

  const roleMatch = claims.ldapGroups.find((group) => roleRegex.test(group));
  const role = roleMatch ? roleMatch.match(roleRegex)?.[1] || '' : '';

  const others = claims.ldapGroups.filter(
    (group) =>
      !schoolRegex.test(group) &&
      !studentDetailRegex.test(group) &&
      !projectRegex.test(group) &&
      !roleRegex.test(group),
  );

  const ldapGroups = {
    school,
    projects,
    projectPaths,
    classes: studentDetails,
    classPaths: studentDetailPaths,
    role,
    others,
  };

  return { ...claims, ldapGroups };
};
