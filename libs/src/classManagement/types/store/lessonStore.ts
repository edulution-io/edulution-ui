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
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';

interface LessonState {
  isLoading: boolean;
  error: Error | null;
  openDialogType: UserGroups | null;
  userGroupToEdit: LmnApiSession | LmnApiProject | LmnApiSchoolClass | null;
  member: LmnUserInfo[];
  groupTypeFromStore: string | undefined;
  groupNameFromStore: string | undefined;
}

interface LessonActions {
  reset: () => void;
  shareFiles: (duplicateFileRequestDto: DuplicateFileRequestDto, share: string | undefined) => Promise<void>;
  collectFiles: (
    collectFileRequestDTO: CollectFileRequestDTO[],
    userRole: string,
    type: LmnApiCollectOperationsType,
    share: string | undefined,
  ) => Promise<void>;
  addManagementGroup: (group: string, users: string[]) => Promise<void>;
  removeManagementGroup: (group: string, users: string[]) => Promise<void>;
  startExamMode: (users: string[]) => Promise<void>;
  stopExamMode: (users: string[], groupName?: string, groupType?: string) => Promise<void>;
  toggleSchoolClassJoined: (isAlreadyJoined: boolean, schoolClass: string) => Promise<void>;
  togglePrinterJoined: (isAlreadyJoined: boolean, printer: string) => Promise<void>;
  toggleProjectJoined: (isAlreadyJoined: boolean, project: string) => Promise<void>;
  setOpenDialogType: (type: UserGroups | null) => void;
  setUserGroupToEdit: (group: LmnApiSession | LmnApiProject | LmnApiSchoolClass | null) => void;
  setMember: (member: LmnUserInfo[]) => void;
  setGroupTypeInStore: (groupType?: string) => void;
  setGroupNameInStore: (groupName?: string) => void;
}

type LessonStore = LessonState & LessonActions;

export default LessonStore;
