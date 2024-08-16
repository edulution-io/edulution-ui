import UserDto from '@libs/user/types/user.dto';

const buildBasePath = (user: UserDto | null): string => {
  const role = user?.ldapGroups?.roles[0];

  switch (role) {
    case 'globaladministrator': {
      return 'global';
    }

    case 'schooladministrator': {
      return user?.ldapGroups?.schools[0] || '';
    }

    case 'teacher': {
      return `${role}s`;
    }

    default: {
      const userClass = user?.ldapGroups?.classes[0];
      return `${role}s/${userClass}`;
    }
  }
};

export default buildBasePath;
