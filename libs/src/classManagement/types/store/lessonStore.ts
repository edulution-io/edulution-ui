import UserGroups from '@libs/groups/types/userGroups.enum';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface LessonState {
  isLoading: boolean;
  error: Error | null;
  openDialogType: UserGroups | null;
  userGroupToEdit: LmnApiSession | LmnApiProject | LmnApiSchoolClass | null;
  member: UserLmnInfo[];
}

interface LessonActions {
  reset: () => void;
  addManagementGroup: (group: string, users: string[]) => Promise<void>;
  removeManagementGroup: (group: string, users: string[]) => Promise<void>;
  startExamMode: (users: string[]) => Promise<void>;
  stopExamMode: (users: string[], groupName?: string, groupType?: string) => Promise<void>;
  setOpenDialogType: (type: UserGroups | null) => void;
  setUserGroupToEdit: (group: LmnApiSession | LmnApiProject | LmnApiSchoolClass | null) => void;
  setMember: (member: UserLmnInfo[]) => void;
}

type LessonStore = LessonState & LessonActions;

export default LessonStore;