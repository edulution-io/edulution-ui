import UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface LmnApiSession {
  sid: string;
  name: string;
  member: UserLmnInfo[];
  membersCount: number;
}

export default LmnApiSession;
