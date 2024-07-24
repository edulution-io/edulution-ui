import UserGroups from '@libs/groups/types/userGroups.enum';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import { ReactElement } from 'react';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import lmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

interface GroupColumn {
  name: UserGroups;
  translationId: string;
  createFunction?: (form: UseFormReturn<GroupForm>) => void;
  icon: ReactElement;
  groups: LmnApiSession[] | LmnApiProject[] | lmnApiSchoolClass[];
}

export default GroupColumn;
