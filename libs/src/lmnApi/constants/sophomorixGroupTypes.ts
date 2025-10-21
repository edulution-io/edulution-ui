import SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixSchoolClassGroupTypes';

const SOPHOMORIX_OTHER_GROUP_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PROJECT: 'project',
  UNKNOWN: 'unknown',
  DEVICE: 'device',
  GLOBALBINDUSER: 'globalbinduser',
  GLOBALADMINISTRATOR: 'globaladministrator',
  SCHOOLBINDUSER: 'schoolbinduser',
  SCHOOLADMINISTRATOR: 'schooladministrator',
  CLASSROOM_STUDENTCOMPUTER: 'classroom-studentcomputer',
  SERVER: 'server',
  PRINTER: 'printer',
} as const;

const SOPHOMORIX_GROUP_TYPES = {
  ...SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES,
  ...SOPHOMORIX_OTHER_GROUP_TYPES,
} as const;

export default SOPHOMORIX_GROUP_TYPES;
