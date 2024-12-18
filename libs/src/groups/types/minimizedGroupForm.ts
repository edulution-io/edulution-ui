import GroupForm from '@libs/groups/types/groupForm';
import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

interface MinimizedGroupForm
  extends Omit<GroupForm, 'quota' | 'proxyAddresses' | 'members' | 'admins' | 'admingroups' | 'membergroups'> {
  members: string[];
  membergroups: string[];
  admins: string[];
  admingroups: string[];
  proxyAddresses: string[];
  quota: LmnApiProjectQuota[];
}

export default MinimizedGroupForm;
