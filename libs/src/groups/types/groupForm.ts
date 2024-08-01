import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

interface GroupForm {
  id: string;
  name: string;
  description: string;
  quota: string;
  mailquota: string;
  maillist: boolean;
  mailalias: boolean;
  join: boolean;
  hide: boolean;
  admins: MultipleSelectorOptionSH[];
  admingroups: MultipleSelectorGroup[];
  members: MultipleSelectorOptionSH[];
  membergroups: MultipleSelectorGroup[];
  school: string;
  creationDate?: string;
}

export default GroupForm;
