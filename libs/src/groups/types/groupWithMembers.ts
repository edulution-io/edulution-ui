import GroupMemberDto from './groupMember.dto';

type GroupWithMembers = {
  id: string;
  name: string;
  path: string;
  members: GroupMemberDto[];
};

export default GroupWithMembers;
