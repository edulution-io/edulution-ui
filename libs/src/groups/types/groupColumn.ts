/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import UserGroups from '@libs/groups/types/userGroups.enum';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import { ReactElement } from 'react';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import lmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';

interface GroupColumn {
  name: UserGroups;
  translationId: string;
  createFunction?: (form: UseFormReturn<GroupForm>) => Promise<void>;
  updateFunction?: (form: UseFormReturn<GroupForm>) => Promise<void>;
  removeFunction?: (id: string) => Promise<void>;
  icon: ReactElement;
  groups: LmnApiSession[] | LmnApiProject[] | lmnApiSchoolClass[] | LmnApiPrinter[];
  isLoading?: boolean;
}

export default GroupColumn;
