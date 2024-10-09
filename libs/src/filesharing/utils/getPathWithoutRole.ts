import UserRoles from '@libs/user/constants/userRoles';

type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

const isEnumRole = (role: string): role is (typeof UserRoles)[keyof typeof UserRoles] => {
  const cleanedRole = role.at(role.length - 1) === 's' ? role.slice(0, -1) : role;
  return Object.values(UserRoles).includes(cleanedRole as UserRole);
};

const removeRoleFromPath = (path: string): string => {
  const pathSegments = path.split('/');

  const filteredSegments = pathSegments.map((segment) => {
    if (isEnumRole(segment)) {
      return '';
    }
    return segment;
  });

  const cleanedPath = filteredSegments.filter((segment) => segment).join('/');

  return cleanedPath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
};

export default removeRoleFromPath;
