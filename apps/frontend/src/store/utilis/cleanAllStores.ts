import useLmnUserStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import useUserStore from '@/store/userStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore';
import useFrameStore from '@/routes/IframeStore';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';

const cleanAllStores = () => {
  useUserStore.getState().reset();
  useFrameStore.getState().reset();
  useLmnUserStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileManagerStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();

  useFileEditorStore.getState().reset();
  useSchoolManagementStore.getState().reset();
  useSurveyTablesPageStore.getState().reset();
  useSurveyEditorFormStore.getState().reset();
};

export default cleanAllStores;
