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

import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import LmnApiPrinterWithMembers from '@libs/lmnApi/types/lmnApiPrinterWithMembers';
import { TFunction } from 'i18next';

interface ClassManagementState {
  userSessions: LmnApiSession[];
  isLoading: boolean;
  isRoomLoading: boolean;
  isPrinterLoading: boolean;
  arePrintersLoading: boolean;
  isSessionLoading: boolean;
  areSessionsLoading: boolean;
  isProjectLoading: boolean;
  areProjectsLoading: boolean;
  isSchoolClassLoading: boolean;
  areSchoolClassesLoading: boolean;
  userProjects: LmnApiProject[];
  userSchoolClasses: LmnApiSchoolClass[];
  searchGroupsError: Error | null;
  isSearchGroupsLoading: boolean;
  error: Error | null;
  userRoom: LmnApiRoom | null;
  printers: LmnApiPrinter[];
}

interface ClassManagementActions {
  reset: () => void;
  searchGroupsOrUsers: (
    searchQuery: string,
    t: TFunction<'translation', undefined>,
  ) => Promise<(MultipleSelectorGroup & LmnApiSearchResult)[]>;
  createSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  updateSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  removeSession: (sessionId: string) => Promise<void>;
  createProject: (form: UseFormReturn<GroupForm>) => Promise<void>;
  updateProject: (form: UseFormReturn<GroupForm>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchSchoolClass: (name: string) => Promise<LmnApiSchoolClassWithMembers | null>;
  fetchUserSchoolClasses: () => Promise<void>;
  fetchProject: (name: string) => Promise<LmnApiProjectWithMembers | null>;
  fetchUserProjects: () => Promise<void>;
  fetchUserSession: (name: string) => Promise<LmnApiSession | null>;
  fetchUserSessions: (withMemberDetails: boolean) => Promise<LmnApiSession[]>;
  fetchRoom: () => Promise<void>;
  fetchPrinters: () => Promise<void>;
  fetchPrinter: (name: string) => Promise<LmnApiPrinterWithMembers | null>;
}

type ClassManagementStore = ClassManagementState & ClassManagementActions;

export default ClassManagementStore;
