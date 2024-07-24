import useLmnApiStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/store/fileManagerStoreOLD';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import UserStore from '@/store/UserStore/UserStore';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useSidebarStore from '@/components/ui/Sidebar/sidebarStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';

const cleanAllStores = () => {
  UserStore.getState().resetTotpSlice();
  UserStore.getState().resetUserSlice();
  UserStore.getState().resetQrCodeSlice();
  useFrameStore.getState().reset();
  useLmnApiStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileManagerStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
  useAppConfigsStore.getState().reset();
  useSidebarStore.getState().reset();
  useClassManagementStore.getState().reset();
  useLessonStore.getState().reset();
};

export default cleanAllStores;
