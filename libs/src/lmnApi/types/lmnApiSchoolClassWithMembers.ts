import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

interface LmnApiSchoolClassWithMembers extends Omit<LmnApiSchoolClass, 'members'> {
  members: UserLmnInfo[];
  admins: UserLmnInfo[];
}

export default LmnApiSchoolClassWithMembers;
