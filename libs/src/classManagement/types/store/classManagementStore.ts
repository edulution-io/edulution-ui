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
  isSessionLoading: boolean;
  isProjectLoading: boolean;
  isSchoolClassLoading: boolean;
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
  fetchUserSessions: () => Promise<void>;
  fetchRoom: () => Promise<void>;
  fetchPrinters: () => Promise<void>;
  fetchPrinter: (name: string) => Promise<LmnApiPrinterWithMembers | null>;
}

type ClassManagementStore = ClassManagementState & ClassManagementActions;

export default ClassManagementStore;
