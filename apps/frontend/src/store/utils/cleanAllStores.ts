import useLmnApiStore from '@/store/useLmnApiStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import UserStore from '@/store/UserStore/UserStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useSidebarStore from '@/components/ui/Sidebar/sidebarStore';
import useDesktopDeploymentStore from '@/pages/DesktopDeployment/DesktopDeploymentStore';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import usePrintPasswordsStore from '@/pages/ClassManagement/PasswordsPage/usePrintPasswordsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import useCommunityLicenseStore from '@/pages/UserSettings/Info/useCommunityLicenseStore';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/components/useDeleteSurveyStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import useParticipatePublicSurveyStore from '@/pages/Surveys/Public/useParticipatePublicSurveyStore';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/PublicConferenceStore';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';

const cleanAllStores = () => {
  UserStore.getState().resetQrCodeSlice();
  UserStore.getState().resetTotpSlice();
  UserStore.getState().resetUserSlice();
  useAppConfigsStore.getState().reset();
  useBulletinCategoryTableStore.getState().reset();
  useBulletinBoardEditorialStore.getState().reset();
  useBulletinBoardStore.getState().reset();
  useClassManagementStore.getState().reset();
  useSubmittedAnswersDialogStore.getState().reset();
  useCommunityLicenseStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
  useConferenceStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useDeleteSurveyStore.getState().reset();
  useDesktopDeploymentStore.getState().reset();
  useFileEditorStore.getState().reset();
  useFileSharingDialogStore.getState().reset();
  useFileSharingStore.getState().reset();
  useFrameStore.getState().reset();
  useLessonStore.getState().reset();
  useLmnApiPasswordStore.getState().reset();
  useLmnApiStore.getState().reset();
  useMailsStore.getState().reset();
  useParticipateDialogStore.getState().reset();
  useParticipatePublicSurveyStore.getState().reset();
  usePrintPasswordsStore.getState().reset();
  usePublicConferenceStore.getState().reset();
  useResultDialogStore.getState().reset();
  useSidebarStore.getState().reset();
  useSurveyEditorFormStore.getState().reset();
  useSurveyTablesPageStore.getState().reset();
  localStorage.removeItem('i18nextLng');
};

export default cleanAllStores;
