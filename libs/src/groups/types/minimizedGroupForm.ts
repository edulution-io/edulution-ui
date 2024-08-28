import GroupForm from '@libs/groups/types/groupForm';

interface MinimizedGroupForm extends Omit<GroupForm, 'members' | 'admins' | 'admingroups' | 'membergroups'> {
  members: string[];
  membergroups: string[];
  admins: string[];
  admingroups: string[];
}

export default MinimizedGroupForm;
