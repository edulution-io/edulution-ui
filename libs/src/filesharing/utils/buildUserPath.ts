import UserRoles from '@libs/user/constants/userRoles';

const buildUserPath = (role: string | null, schoolClass: string, username?: string | null): string => {
  switch (role) {
    case UserRoles.GLOBAL_ADMIN: {
      return 'global';
    }

    case UserRoles.SCHOOL_ADMIN: {
      return schoolClass || '';
    }

    case UserRoles.TEACHER: {
      return username ? `${role}s/${username}` : `${role}s`;
    }

    default: {
      return username ? `${role}s/${schoolClass}/${username}` : `${role}s/${schoolClass}`;
    }
  }
};

export default buildUserPath;
