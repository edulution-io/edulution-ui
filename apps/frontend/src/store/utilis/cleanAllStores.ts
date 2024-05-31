import useLmnUserStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import useUserStore from '@/store/userStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore';
import useIframeStore from '@/routes/IframeStore';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import useShowSurveyResultsDialogStore
  from '@/pages/Surveys/Dialogs/show-survey-results/ShowSurveyResultsDialogStore';
import useShowSurveyAnswerDialogStore
  from '@/pages/Surveys/Dialogs/show-submitted-answer/ShowSurveyAnswerDialogStore';
import usePropagateSurveyDialogStore from "@/pages/Surveys/Dialogs/Propagate/PropagateSurveyDialogStore.ts";
import useParticipateSurveyDialogStore from "@/pages/Surveys/Dialogs/Participate/ParticipateSurveyDialogStore.ts";

const cleanAllStores = () => {
  useUserStore.getState().reset();
  useIframeStore.getState().reset();
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

};

export default cleanAllStores;
