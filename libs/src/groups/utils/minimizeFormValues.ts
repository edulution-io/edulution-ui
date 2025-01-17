import GroupForm from '@libs/groups/types/groupForm';
import MinimizedGroupForm from '@libs/groups/types/minimizedGroupForm';
import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

const minimizeFormValues = (formValues: GroupForm): MinimizedGroupForm => ({
  ...formValues,
  admins: formValues.admins.map((m) => m.value),
  admingroups: formValues.admingroups.map((m) => m.name),
  members: formValues.members.map((m) => m.value),
  membergroups: formValues.membergroups.map((m) => m.name),
  proxyAddresses: formValues.proxyAddresses.split(',').filter(Boolean),
  quota: JSON.parse(formValues.quota || '[]') as LmnApiProjectQuota[],
});

export default minimizeFormValues;
