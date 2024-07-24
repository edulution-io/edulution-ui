interface LessonState {
  isLoading: boolean;
  error: Error | null;
}

interface LessonActions {
  reset: () => void;
  addManagementGroup: (group: string, users: string[]) => Promise<void>;
  removeManagementGroup: (group: string, users: string[]) => Promise<void>;
  startExamMode: (users: string[]) => Promise<void>;
  stopExamMode: (users: string[], groupName?: string, groupType?: string) => Promise<void>;
}

type LessonStore = LessonState & LessonActions;

export default LessonStore;
