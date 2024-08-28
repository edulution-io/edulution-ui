import UserDto from '@libs/user/types/user.dto';
import UserRoles from '@libs/user/constants/userRoles';

const buildBasePath = (user: UserDto | null): string => {
  const role = user?.ldapGroups?.roles[0];
  const username = user?.username;

  switch (role) {
    case UserRoles.GLOBAL_ADMIN: {
      return 'global';
    }

    case UserRoles.SCHOOL_ADMIN: {
      return user?.ldapGroups?.schools[0] || '';
    }

    case UserRoles.TEACHER: {
      return `${role}s/${username}`;
    }

    default: {
      const userClass = user?.ldapGroups?.classes[0];
      return `${role}s/${userClass}/${username}`;
    }
  }
};

export default buildBasePath;
