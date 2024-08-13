import GroupMemberDto from '@libs/groups/types/groupMember.dto';

export default interface GroupDto {
  id: string;
  name: string;
  path: string;
  members: GroupMemberDto[];
}
