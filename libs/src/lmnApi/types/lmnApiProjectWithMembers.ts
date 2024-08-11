import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

interface LmnApiProjectWithMembers extends Omit<LmnApiProject, 'members'> {
  members: UserLmnInfo[];
  admins: UserLmnInfo[];
}

export default LmnApiProjectWithMembers;
