import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

interface GroupForm {
  name: string;
  description: string;
  quota: string;
  mailquota: string;
  join: boolean;
  hide: boolean;
  admins: MultipleSelectorOptionSH[];
  admingroups: MultipleSelectorOptionSH[];
  members: MultipleSelectorOptionSH[];
  membergroups: MultipleSelectorOptionSH[];
  school: string;
}

export default GroupForm;
