import GroupForm from '@libs/groups/types/groupForm';
import MinimizedGroupForm from '@libs/groups/types/minimizedGroupForm';

const minimizeFormValues = (formValues: GroupForm): MinimizedGroupForm => ({
  ...formValues,
  admins: formValues.admins.map((m) => m.value),
  admingroups: formValues.admingroups.map((m) => m.name),
  members: formValues.members.map((m) => m.value),
  membergroups: formValues.membergroups.map((m) => m.name),
});

export default minimizeFormValues;
