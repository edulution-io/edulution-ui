// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import type UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface LmnApiSession {
  sid: string;
  name: string;
  members: UserLmnInfo[];
  membersCount: number;
}

export default LmnApiSession;
