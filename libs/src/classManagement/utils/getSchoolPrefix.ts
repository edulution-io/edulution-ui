import UserLmnInfo from '@libs/lmnApi/types/userInfo';

const getSchoolPrefix = (user: UserLmnInfo | null) =>
  user?.sophomorixSchoolPrefix !== '---' ? `${user?.sophomorixSchoolPrefix}-` : '';

export default getSchoolPrefix;
