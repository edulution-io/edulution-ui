import UserDto from '@libs/user/types/user.dto';
import UserRoles from '@libs/user/constants/userRoles';

const buildBasePath = (user: UserDto | null, schoolClass: string): string => {
  const role = user?.ldapGroups?.roles[0];

  switch (role) {
    case UserRoles.GLOBAL_ADMIN: {
      return 'global';
    }

    case UserRoles.SCHOOL_ADMIN: {
      return user?.ldapGroups?.schools[0] || '';
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
