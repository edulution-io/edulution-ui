import { DirectoryFile } from '@/datatypes/filesystem';
import { AppConfigOptions } from '@/datatypes/appConfigOptions';

export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type AppConfig = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
};

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  path?: string;
}

export interface MenuBarEntryProps {
  menuItems: MenuItem[];
  title: string;
  disabled?: boolean;
  icon: string;
  color: string;
}

export enum APPS {
  TICKET_SYSTEM = 'ticketsystem',
  MAIL = 'mail',
  CHAT = 'chat',
  CONFERENCES = 'conferences',
  KNOWLEDGE_BASE = 'knowledgebase',
  FILE_SHARING = 'filesharing',
  FORUMS = 'forums',
  ROOM_BOOKING = 'roombooking',
  LEARNING_MANAGEMENT = 'learningmanagement',
  SCHOOL_INFORMATION = 'schoolinformation',
  SCHOOL_MANAGEMENT = 'schoolmanagement',
  PRINTER = 'printer',
  NETWORK = 'network',
  LOCATION_SERVICES = 'locationservices',
  DESKTOP_DEPLOYMENT = 'desktopdeployment',
  SURVEYS = 'surveys',
  WLAN = 'wlan',
  MOBILE_DEVICES = 'mobiledevices',
  VIRTUALIZATION = 'virtualization',
  FIREWALL = 'firewall',
  ANTIMALWARE = 'antimalware',
  BACKUP = 'backup',
  WHITEBOARD = 'whiteboard',
}

export interface FileTypePreviewProps {
  file: DirectoryFile;
  onClose?: () => void;
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

// TODO: Move to library
export type UserInfo = {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  isTotpSet: boolean;
};
