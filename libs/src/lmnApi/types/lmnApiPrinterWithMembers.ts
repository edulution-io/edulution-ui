import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';

interface LmnApiPrinterWithMembers extends Omit<LmnApiPrinter, 'members'> {
  members: UserLmnInfo[];
  admins: UserLmnInfo[];
}

export default LmnApiPrinterWithMembers;
