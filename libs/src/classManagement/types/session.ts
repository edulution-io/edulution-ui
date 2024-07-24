import GroupMemberDto from '@libs/groups/types/groupMember.dto';

interface Session {
  sid: string;
  name: string;
  members: GroupMemberDto[];
  membersCount: number;
}

export default Session;
