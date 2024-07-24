import GroupDto from '@libs/groups/types/group.dto';
import UserGroups from '@libs/groups/types/userGroups.enum';
import Session from '@libs/classManagement/types/session';

type UserGroupsDto = {
  [UserGroups.Classes]: GroupDto[];
  [UserGroups.Projects]: GroupDto[];
  [UserGroups.Sessions]: Session[];
};

export default UserGroupsDto;
