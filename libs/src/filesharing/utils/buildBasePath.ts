import UserRoles from '@libs/user/constants/userRoles';

const buildBasePath = (role: string | null, schoolClass: string): string => {
  switch (role) {
    case UserRoles.GLOBAL_ADMIN: {
      return 'global';
    }

    case UserRoles.SCHOOL_ADMIN: {
      return schoolClass || '';
    }

    case UserRoles.TEACHER: {
      return `${role}s`;
    }

    default: {
      return `${role}s/${schoolClass}`;
    }
  }
};

export default buildBasePath;
