import useLmnUserStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import useUserStore from '@/store/userStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore';
import useFrameStore from '@/routes/IframeStore';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import useShowSurveyResultsDialogStore from '@/pages/Surveys/Subpages/Dialogs/ShowResultsVisualization/ShowSurveyResultsDialogStore';
import useShowSurveyAnswerDialogStore from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialogStore';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore.ts';
import useEditorStore from '@/pages/Surveys/Subpages/Editor/EditorStore';

const cleanAllStores = () => {
  useUserStore.getState().reset();
  useFrameStore.getState().reset();
  useEditorStore.getState().reset();
  useLmnUserStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileManagerStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();

  useFileEditorStore.getState().reset();
  useSurveysPageStore.getState().reset();
  usePropagateSurveyDialogStore.getState().reset();
  useParticipateSurveyDialogStore.getState().reset();
  useShowSurveyAnswerDialogStore.getState().reset();
  useShowSurveyResultsDialogStore.getState().reset();
  useSchoolManagementStore.getState().reset();
};

export default cleanAllStores;
