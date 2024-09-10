import UserRoles from '@libs/user/constants/userRoles';

const buildBasePath = (role: string | undefined, schoolClass: string | undefined): string => {
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
      const userClass = schoolClass || '';
      return `${role}s/${userClass}`;
    }
  }
};

export default buildBasePath;
